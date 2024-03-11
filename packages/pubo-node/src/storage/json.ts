import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { debounce } from 'pubo-utils';

export class JsonStorage {
  private readonly path: string;
  private _state: any = {};
  private readonly sync: any;

  get state() {
    return this._state;
  }

  constructor(path: string) {
    this.path = path;
    this.restore();

    this.sync = debounce(() => {
      try {
        writeFileSync(this.path, JSON.stringify(this._state));
      } catch (err) {
        console.log(err);
      }
    }, 1000);
  }

  private restore(): any {
    try {
      const buf = readFileSync(this.path);
      this._state = JSON.parse(buf.toString());
    } catch (err) {
      console.log(err);
      const str = process.platform === 'win32' ? '\\' : '/';
      mkdirSync(this.path.split(str).slice(0, -1).join(str), { recursive: true });
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
  }
}
