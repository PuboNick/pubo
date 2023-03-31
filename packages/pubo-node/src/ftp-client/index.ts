import { random, waitFor } from 'pubo-utils';
import type { Stream } from 'stream';

export interface FtpFile {
  name: string;
  owner: string;
  group: string;
  size: number;
  date: Date;
  type: string;
}

export interface FtpConnectOptions {
  user: string;
  host: string;
  password: string;
  driver: any;
}

type GetFile = (path: string) => Promise<Buffer>;
type PutFile = (input: string | Buffer | Stream, path: string) => Promise<string>;
type DeleteFile = (path: string) => Promise<string>;
type ListFiles = (path: string) => Promise<FtpFile[]>;
type RenameFile = (path: string, old: string) => Promise<string>;

export interface FtpClientInterface {
  get: GetFile;
  put: PutFile;
  delete: DeleteFile;
  list: ListFiles;
  rename: RenameFile;
}

export class FtpClient implements FtpClientInterface {
  private readonly driver: any;
  private readonly options: any;

  private readonly state = { running: false, connected: false, destroyed: false, connecting: false };
  private client: any;
  private _len = 0;

  id = random();

  constructor({ driver, ...options }: FtpConnectOptions) {
    this.driver = driver;
    this.options = options;
  }

  get len() {
    return this._len;
  }

  set len(n) {
    this._len = n;
    if (this._len < 1) {
      this.close();
    }
  }

  put = this.bind('put');
  delete = this.bind('delete');
  list = this.bind('list');
  rename = this.bind('rename');

  private async connect(): Promise<any> {
    if (!this.client) {
      this.client = new this.driver();
    }
    this.state.destroyed = false;
    if (this.state.connecting) {
      await waitFor(() => this.state.connected, { checkTime: 1000, timeout: 10000 });
      return 'connected';
    }
    this.state.connecting = true;
    return new Promise((resolve, reject) => {
      this.client.once('ready', () => {
        this.state.connected = true;
        resolve('connected');
        this.state.connecting = false;
      });
      this.client.once('error', (err) => {
        reject(err);
        this.close();
      });
      this.client.connect({ ...this.options });
    });
  }

  private close() {
    this.client.end();
    this.state.connected = false;
    this.state.destroyed = true;
    this.state.connecting = false;
    this.client = null;
  }

  private async run({ fn, args }: { fn: string; args: any[] }): Promise<any> {
    this.len += 1;
    if (!this.state.connected) {
      await this.connect();
    }
    if (this.state.running) {
      await waitFor(() => !this.state.running, { checkTime: 1000, timeout: 6000000 });
    }
    this.state.running = true;

    return new Promise((resolve, reject) => {
      this.client[fn](...args, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  private bind(fn: string) {
    return async (...args): Promise<any> => {
      const res = await this.run({ fn, args });
      this.state.running = false;
      this.len -= 1;
      return res;
    };
  }

  async get(...args): Promise<Buffer> {
    let res = Buffer.alloc(0);
    const stream = await this.run({ fn: 'get', args });

    return new Promise((resolve) => {
      stream.on('data', (chunk) => {
        res = Buffer.concat([res, chunk], res.byteLength + chunk.byteLength);
      });
      stream.on('end', () => {
        resolve(res);
        this.state.running = false;
        this.len -= 1;
      });
    });
  }
}

export class FtpClientPool implements FtpClientInterface {
  private readonly options: FtpConnectOptions;
  private readonly maxConnection: number;
  private readonly pool: FtpClient[] = [];

  constructor({ maxConnection = 5, ...options }: { maxConnection?: number } & FtpConnectOptions) {
    this.options = options;
    this.maxConnection = maxConnection;
  }

  get = this.bind('get');
  put = this.bind('put');
  delete = this.bind('delete');
  list = this.bind('list');
  rename = this.bind('rename');

  get len() {
    return this.pool.length;
  }

  private get client() {
    if (this.pool.length < this.maxConnection) {
      const client = new FtpClient(this.options);
      this.pool.push(client);
      return client;
    }

    this.pool.sort((a, b) => a.len - b.len);
    return this.pool[0];
  }

  private bind(fn) {
    return async (...args) => {
      const client = this.client;
      const res = await client[fn](...args);
      if (client.len < 1) {
        const index = this.pool.findIndex((item) => item.id === client.id);
        this.pool.splice(index, 1);
      }
      return res;
    };
  }
}
