import { SyncQueue } from 'pubo-utils';
import type { Stream } from 'stream';

interface FtpFile {
  name: string;
  owner: string;
  group: string;
  size: number;
  date: Date;
  type: string;
}

interface FtpConnectOptions {
  user: string;
  host: string;
  password: string;
}

type GetFile = (path: string) => Promise<Stream>;
type PutFile = (input: string | Buffer | Stream, path: string) => Promise<string>;
type DeleteFile = (path: string) => Promise<string>;
type ListFiles = (path: string) => Promise<FtpFile[]>;
type RenameFile = (path: string, old: string) => Promise<string>;

export class FtpClient {
  private readonly driver: any;
  private readonly options: any;
  private readonly queue = new SyncQueue();

  constructor({ driver, ...options }: { driver: any } & FtpConnectOptions) {
    this.driver = driver;
    this.options = options;
  }

  get: GetFile = this._bind('get');
  put: PutFile = this._bind('put');
  delete: DeleteFile = this._bind('delete');
  list: ListFiles = this._bind('list');
  rename: RenameFile = this._bind('rename');

  private _push(cb): any {
    return (...args) => this.queue.push(() => cb.call(this, ...args));
  }

  private _bind(fn: string) {
    return this._push(async (...args) => {
      const c = await this.connect();
      return this._run(fn, c, args);
    });
  }

  private _run(fn, c, args) {
    return new Promise((resolve, reject) => {
      c[fn](...args, (err, res) => {
        if (err) {
          reject(err);
          c.end();
        } else {
          resolve(res || 'operation successful.');
          if (fn === 'get') {
            res.once('close', () => c.end());
          } else {
            c.end();
          }
        }
      });
    });
  }

  private connect(): Promise<any> {
    return new Promise((resolve, reject) => {
      const c: any = new this.driver();
      c.once('ready', () => {
        resolve(c);
      });
      c.once('error', (err) => {
        reject(err);
        c.end();
      });
      c.connect({ ...this.options });
    });
  }
}
