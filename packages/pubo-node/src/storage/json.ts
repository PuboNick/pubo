import { readFileSync, writeFile, mkdirSync } from 'fs';
import { SyncQueue } from 'pubo-utils';

export class JsonStorage {
  private readonly path: string;
  private _state: any = {};
  private readonly queue = new SyncQueue();

  get state() {
    return this._state;
  }

  constructor(path: string) {
    this.path = path;
    this.restore();
  }

  private sync() {
    if (this.queue.length > 0) {
      return;
    }
    this.queue.push(this._sync.bind(this));
  }

  private async _sync() {
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
      console.log(err);
      const str = process.platform === 'win32' ? '\\' : '/';
      if (str) {
        mkdirSync(this.path.split(str).slice(0, -1).join(str), { recursive: true });
      }
      this._state = {};
    }
  }

  get(key?: string) {
    if (!key) {
      return this.state;
    } else {
      return this.state[key];
    }
  }

  set(key: string, values: any) {
    this._state[key] = values;
    this.sync();
  }

  merge(values: any) {
    for (const key of Object.keys(values)) {
      this._state[key] = values[key];
    }
    this.sync();
  }
}
