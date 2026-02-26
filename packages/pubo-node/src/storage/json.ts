import { readFileSync, writeFile, mkdirSync, writeFileSync } from 'fs';
import { cloneDeep, SyncQueue } from 'pubo-utils';
import { v4 as uuid } from 'uuid';
import type { Cluster } from 'cluster';

interface StorageInstance {
  getState: () => Promise<Record<string, unknown>>;
  setState: (state: Record<string, unknown>) => Promise<void>;
}

interface WorkerMessage {
  key: string;
  type: 'get' | 'set';
  payload?: Record<string, unknown>;
  uid?: string;
}

interface ClusterModule {
  isPrimary: boolean;
  on(event: 'online' | 'exit', listener: (worker: any) => void): this;
}

// 主线程的实现
class Manager implements StorageInstance {
  private readonly path: string;
  private _state: Record<string, unknown> = {};
  private readonly queue = new SyncQueue();
  private readonly key: string;
  private readonly defaultState?: Record<string, unknown>;

  constructor(path: string, defaultState?: Record<string, unknown>, clusterModule?: ClusterModule) {
    this.path = path;
    this.defaultState = defaultState;
    this.key = encodeURIComponent(path);

    if (clusterModule) {
      clusterModule.on('online', (worker) => {
        worker.on('message', (message: WorkerMessage) => {
          this.onMessage(message, worker);
        });
      });
      clusterModule.on('exit', (worker) => {
        worker.removeAllListeners('message');
      });
    }

    this.restore();

    if (global.GlobalEmitter) {
      global.GlobalEmitter.on('SIGINT', this.kill.bind(this));
    } else {
      process.on('SIGINT', () => {
        this.kill().then(() => process.exit(0));
      });
    }
  }

  // 进程退出时,同步文件
  private async kill(): Promise<void> {
    await this.queue.push(() => this.syncFile());
  }

  private async onMessage(message: WorkerMessage, worker: any): Promise<void> {
    if (message.key !== this.key) {
      return;
    }

    let payload: any;
    if (message.type === 'get') {
      payload = await this.getState();
    } else if (message.type === 'set' && message.payload) {
      payload = await this.setState(message.payload);
    }

    worker.send({ uid: message.uid, key: this.key, payload });
  }

  private sync(): void {
    if (this.queue.length > 0) {
      return;
    }
    this.queue.push(this._syncFile.bind(this));
  }

  // 同步文件备份
  private async syncFile(): Promise<void> {
    writeFileSync(this.path, JSON.stringify(this._state));
  }

  // 异步文件备份
  private async _syncFile(): Promise<void> {
    return new Promise((resolve, reject) => {
      writeFile(this.path, JSON.stringify(this._state), (err) => {
        if (err) {
          reject(err);
        } else {
          setTimeout(resolve, 100);
        }
      });
    });
  }

  private restore(): void {
    try {
      const buf = readFileSync(this.path);
      this._state = JSON.parse(buf.toString());
    } catch {
      const separator = process.platform === 'win32' ? '\\' : '/';
      const folder = this.path.split(separator).slice(0, -1).join(separator);
      if (folder) {
        mkdirSync(folder, { recursive: true });
      }
      this.setState(this.defaultState ?? {});
    }
  }

  async getState(): Promise<Record<string, unknown>> {
    return cloneDeep(this._state) as Record<string, unknown>;
  }

  async setState(values: Record<string, unknown>): Promise<void> {
    this._state = values;
    this.sync();
  }
}

// work 线程的实现
class Worker implements StorageInstance {
  private readonly key: string;
  private readonly callback: Record<string, (data: unknown) => void> = {};

  constructor(path: string) {
    this.key = encodeURIComponent(path);
    process.on('message', this.onMessage.bind(this));
  }

  private onMessage(message: WorkerMessage): void {
    if (message.key !== this.key) {
      return;
    }

    if (message.uid && typeof this.callback[message.uid] === 'function') {
      this.callback[message.uid](message.payload);
      delete this.callback[message.uid];
    }
  }

  async call({ type, payload }: { type: 'get' | 'set'; payload?: Record<string, unknown> }): Promise<unknown> {
    return new Promise((resolve) => {
      const uid = uuid();
      this.callback[uid] = (data) => resolve(data);

      process.send!({ uid, type, payload, key: this.key });
    });
  }

  async getState(): Promise<Record<string, unknown>> {
    return (await this.call({ type: 'get', payload: {} })) as Record<string, unknown>;
  }

  async setState(payload: Record<string, unknown>): Promise<void> {
    await this.call({ type: 'set', payload });
  }
}

export interface JsonStorageOptions {
  // 初始值，程序运行时会重置为初始值
  initialState?: Record<string, unknown>;
  // 默认值
  defaultState?: Record<string, unknown>;
}

export class JsonStorage {
  private readonly instance: StorageInstance;
  private readonly queue = new SyncQueue();

  constructor(path: string, options: JsonStorageOptions = {}) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const clusterModule = require('cluster') as ClusterModule;

    if (clusterModule.isPrimary) {
      this.instance = new Manager(path, options.defaultState, clusterModule);
    } else {
      this.instance = new Worker(path);
    }

    if (options?.initialState) {
      this.merge(options.initialState);
    }
  }

  private async getState(): Promise<Record<string, unknown>> {
    return this.queue.push(this.instance.getState.bind(this.instance));
  }

  private async setState(state: Record<string, unknown>): Promise<void> {
    return this.queue.push(() => this.instance.setState(state));
  }

  async get(key?: string): Promise<unknown> {
    if (!key) {
      return this.getState();
    }
    const state = await this.getState();
    return state[key];
  }

  async set(key: string, values: unknown): Promise<void> {
    const state = await this.getState();
    state[key] = values;
    await this.setState(state);
  }

  async merge(values: Record<string, unknown>): Promise<void> {
    const state = await this.getState();
    for (const key of Object.keys(values)) {
      state[key] = values[key];
    }
    await this.setState(state);
  }

  async remove(key: string): Promise<void> {
    const state = await this.getState();
    delete state[key];
    await this.setState(state);
  }
}
