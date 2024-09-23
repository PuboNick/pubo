import { readFileSync, writeFile, mkdirSync } from 'fs';
import { SyncQueue } from 'pubo-utils';
import { v4 as uuid } from 'uuid';

const cluster = require('cluster');

interface StorageInstance {
  getState: () => Promise<any>;
  setState: (state: any) => Promise<any>;
}

// 主线程的实现
class Manager implements StorageInstance {
  private readonly path: string;
  private _state: any = {};
  private readonly queue = new SyncQueue();
  private readonly key: string;
  private readonly defaultState: any;

  constructor(path: string, defaultState?: any) {
    this.path = path;
    this.defaultState = defaultState;
    this.key = encodeURIComponent(path);
    cluster.on('online', (worker) => {
      worker.on('message', (message) => {
        this.onMessage(message, worker);
        message = null;
      });
    });
    cluster.on('exit', (worker) => {
      worker.removeAllListeners('message');
      worker = null;
    });
    this.restore();
  }

  private async onMessage(message, worker) {
    if (message.key !== this.key) {
      return;
    }

    let payload;
    if (message.type === 'get') {
      payload = await this.getState();
    } else if (message.type === 'set') {
      payload = await this.setState(message.payload);
    }

    worker.send({ uid: message.uid, key: this.key, payload });
    message = null;
    worker = null;
  }

  private async sync() {
    if (this.queue.length > 0) {
      return;
    }
    await this.queue.push(this._syncFile.bind(this));
  }

  private async _syncFile() {
    return new Promise((resolve, reject) => {
      writeFile(this.path, JSON.stringify(this._state), (err) => {
        if (err) {
          reject(err);
        } else {
          resolve('');
        }
      });
    });
  }

  private restore(): any {
    try {
      const buf = readFileSync(this.path);
      this._state = JSON.parse(buf.toString());
    } catch (err) {
      const str = process.platform === 'win32' ? '\\' : '/';
      if (str) {
        mkdirSync(this.path.split(str).slice(0, -1).join(str), { recursive: true });
      }
      this.setState(this.defaultState ?? {});
    }
  }

  async getState() {
    return this._state;
  }

  async setState(values) {
    this._state = values;
    await this.sync();
  }
}

// work 线程的实现
class Worker implements StorageInstance {
  private readonly key: string;
  private readonly callback: any = {};

  constructor(path: string) {
    this.key = encodeURIComponent(path);
    process.on('message', this.onMessage.bind(this));
  }

  private onMessage(message) {
    if (message.key !== this.key) {
      return;
    }

    if (typeof this.callback[message.uid] === 'function') {
      this.callback[message.uid](message.payload);
      delete this.callback[message.uid];
    }

    message = null;
  }

  async call({ type, payload }) {
    return new Promise((resolve) => {
      const uid = uuid();
      this.callback[uid] = (data) => resolve(data);
      // @ts-ignore
      process.send({ uid, type, payload, key: this.key });

      payload = null;
      type = null;
    });
  }

  async getState() {
    return this.call({ type: 'get', payload: {} });
  }

  async setState(payload: any) {
    return this.call({ type: 'set', payload });
  }
}

export interface JsonStorageOptions {
  // 初始值，程序运行时会重置为初始值
  initialState?: any;
  // 默认值
  defaultState?: any;
}

export class JsonStorage {
  private readonly instance: StorageInstance;

  constructor(path: string, options: JsonStorageOptions = {}) {
    if (cluster.isPrimary) {
      this.instance = new Manager(path, options.defaultState);
    } else {
      this.instance = new Worker(path);
    }

    if (options?.initialState) {
      this.merge(options.initialState);
    }
  }

  private async getState() {
    return this.instance.getState();
  }

  private async setState(state: any) {
    return this.instance.setState(state);
  }

  async get(key?: string) {
    if (!key) {
      return this.getState();
    } else {
      const state = await this.getState();
      return state[key];
    }
  }

  async set(key: string, values: any) {
    const state = await this.getState();
    state[key] = values;
    await this.setState(state);
  }

  async merge(values: any) {
    const state = await this.getState();
    for (const key of Object.keys(values)) {
      state[key] = values[key];
    }
    await this.setState(state);
  }

  async remove(key: string) {
    const state = await this.getState();
    delete state[key];
    await this.setState(state);
  }
}
