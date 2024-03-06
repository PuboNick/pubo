import { readFileSync, writeFile, mkdirSync } from 'fs';
import * as pako from 'pako';

export class JsonStorage {
  private readonly path: string;

  constructor(path: string) {
    this.path = path;
  }

  private set state(values: any) {
    const data = pako.deflate(JSON.stringify(values));
    const buf = Buffer.from(data);
    writeFile(this.path, buf, (err) => err && console.log(err));
  }

  private get state(): any {
    try {
      const buf = readFileSync(this.path);
      const data = pako.inflate(buf, { to: 'string' });
      return JSON.parse(data);
    } catch (err) {
      console.log(err);
      mkdirSync(this.path.split('/').slice(0, -1).join('/'), { recursive: true });
      return {};
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
