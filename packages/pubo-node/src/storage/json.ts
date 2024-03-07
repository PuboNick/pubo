import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import debounce from 'lodash.debounce';

export class JsonStorage {
  private readonly path: string;
  private _state: any = {};
  private readonly sync: any;

  get state() {
    return this._state;
  }

  set state(values) {
    this._state = values;
    this.sync();
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
      return { ...this.state };
    } else {
      return this.state[key];
    }
  }

  set(key: string, values: any) {
    const temp = { ...this.state };
    temp[key] = values;
    this.state = temp;
  }

  merge(values: any) {
    this.state = { ...this.state, ...values };
  }
}
