import { readFileSync, writeFile } from 'fs';
import * as pako from 'pako';

export class JsonStorage {
  private readonly path: string;
  private _state: any = {};

  constructor(path: string) {
    this.path = path;
    this.init();
  }

  private init() {
    try {
      const buf = readFileSync(this.path);
      const data = pako.inflate(buf, { to: 'string' });
      this._state = JSON.parse(data);
    } catch (err) {
      this.state = {};
    }
  }

  private set state(values: any) {
    const data = pako.deflate(JSON.stringify(values));
    const buf = Buffer.from(data);
    writeFile(this.path, buf, (err) => err && console.log(err));
    this._state = values;
  }

  private get state(): any {
    return this._state;
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
    this.state = { ...this._state, ...values };
  }
}
