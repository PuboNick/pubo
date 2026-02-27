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
  driver: new () => FtpDriver;
}

interface FtpDriver {
  once(event: 'ready' | 'error', listener: (err?: Error) => void): this;
  connect(options: Record<string, string>): this;
  end(): void;
  get(path: string, callback: (err: Error | null, stream: NodeJS.ReadableStream) => void): void;
  put(input: string | Buffer | Stream, path: string, callback: (err: Error | null, result: string) => void): void;
  delete(path: string, callback: (err: Error | null, result: string) => void): void;
  list(path: string, callback: (err: Error | null, list: FtpFile[]) => void): void;
  rename(oldPath: string, newPath: string, callback: (err: Error | null, result: string) => void): void;
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
  private readonly driver: new () => FtpDriver;
  private readonly options: Record<string, string>;

  private readonly state = { running: false, connected: false, destroyed: false, connecting: false };
  private client: FtpDriver | null = null;
  private _len = 0;

  readonly id: string = random();

  constructor({ driver, ...options }: FtpConnectOptions) {
    this.driver = driver;
    this.options = options;
  }

  get len(): number {
    return this._len;
  }

  set len(n: number) {
    this._len = n;
    if (this._len < 1) {
      this.close();
    }
  }

  put = this.bind('put');
  delete = this.bind('delete');
  list = this.bind('list');
  rename = this.bind('rename');

  private async connect(): Promise<string> {
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
      this.client!.once('ready', () => {
        this.state.connected = true;
        resolve('connected');
        this.state.connecting = false;
      });
      this.client!.once('error', (err) => {
        reject(err);
        this.close();
      });
      this.client!.connect(this.options);
    });
  }

  private close(): void {
    this.client?.end();
    this.state.connected = false;
    this.state.destroyed = true;
    this.state.connecting = false;
    this.client = null;
  }

  private async run<T>({ fn, args }: { fn: string; args: unknown[] }): Promise<T> {
    this.len += 1;
    if (!this.state.connected) {
      await this.connect();
    }
    if (this.state.running) {
      await waitFor(() => !this.state.running, { checkTime: 1000, timeout: 6000000 });
    }
    this.state.running = true;

    return new Promise((resolve, reject) => {
      (this.client as FtpDriver)[fn](...args, (err: Error | null, res: T) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  private bind<K extends keyof FtpClientInterface>(fn: K): FtpClientInterface[K] {
    return async (...args: any[]) => {
      const res: any = await this.run({ fn, args });
      this.state.running = false;
      this.len -= 1;
      return res;
    };
  }

  async get(path: string): Promise<Buffer> {
    let res = Buffer.alloc(0);
    const stream = await this.run<NodeJS.ReadableStream>({ fn: 'get', args: [path] });

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => {
        // @ts-ignore
        res = Buffer.concat([res, chunk], res.byteLength + chunk.byteLength);
      });
      stream.on('end', () => {
        resolve(res);
        this.state.running = false;
        this.len -= 1;
      });
      stream.on('error', reject);
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

  get len(): number {
    return this.pool.length;
  }

  private get client(): FtpClient {
    if (this.pool.length < this.maxConnection) {
      const client = new FtpClient(this.options);
      this.pool.push(client);
      return client;
    }

    this.pool.sort((a, b) => a.len - b.len);
    return this.pool[0];
  }

  private bind<K extends keyof FtpClientInterface>(fn: K): FtpClientInterface[K] {
    return async (...args: any[]) => {
      const client: any = this.client;
      const res: any = await client[fn](...args);
      if (client.len < 1) {
        const index = this.pool.findIndex((item) => item.id === client.id);
        this.pool.splice(index, 1);
      }
      return res;
    };
  }
}
