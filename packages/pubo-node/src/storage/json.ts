import { readFileSync, writeFile } from 'fs';
import * as pako from 'pako';
import SparkMd5 from 'spark-md5';

export class JsonStorage {
  private readonly path: string;
  private _state: any = {};
  private _md5: any = '';

  constructor(path: string) {
    this.path = path;
    this.init();
  }

  private init() {
    try {
      const buf = readFileSync(this.path);
      const data = pako.inflate(buf, { to: 'string' });
      this._md5 = SparkMd5.hash(data);
      this._state = JSON.parse(data);
    } catch (err) {
      this.state = {};
    }
  }

  private set state(values: any) {
    this._state = values;
    const str = JSON.stringify(values);
    const md5 = SparkMd5.hash(values);
    if (md5 === this._md5) {
      return;
    }
    const data = pako.deflate(str);
    const buf = Buffer.from(data);
    writeFile(this.path, buf, (err) => err && console.log(err));
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
