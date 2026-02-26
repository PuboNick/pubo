export interface CreateClientProps<T = unknown> {
  url: string;
  options?: GrpcClientOptions;
  ServiceImp: new (impl: { request: GrpcRequestFn }) => T;
  Grpc: GrpcStatic;
  cert?: Buffer;
}

interface GrpcClientOptions {
  'grpc.max_send_message_length'?: number;
  'grpc.max_receive_message_length'?: number;
  timeout?: number;
}

interface GrpcCredentials {
  createSsl(cert?: Buffer): GrpcCredentials;
  createInsecure(): GrpcCredentials;
}

interface GrpcClientStatic {
  new (address: string, credentials: GrpcCredentials, options: GrpcClientOptions): GrpcClientInstance;
}

interface GrpcClientInstance {
  close(): void;
  makeUnaryRequest(
    path: string,
    serialize: (obj: unknown) => Buffer,
    deserialize: (bytes: Buffer) => unknown,
    data: Buffer,
    callback: (err: Error | null, response: Buffer) => void,
  ): void;
}

type GrpcRequestFn = (service: string, method: string, data?: unknown) => Promise<Buffer>;

interface GrpcStatic {
  credentials: GrpcCredentials;
  Client: GrpcClientStatic;
}

const passThrough = (argument) => argument;

class GrpcClient {
  private readonly url: string;
  private readonly options: GrpcClientOptions;
  private readonly Grpc;
  private readonly credentials: GrpcCredentials;
  private client: GrpcClientInstance | null = null;
  private _timeout: ReturnType<typeof setTimeout> | null = null;
  connections = 0;

  constructor({
    url,
    options = {},
    Grpc,
    cert,
  }: {
    url: string;
    options?: GrpcClientOptions;
    Grpc: GrpcStatic;
    cert?: Buffer;
  }) {
    const opt: GrpcClientOptions = {
      'grpc.max_send_message_length': -1,
      'grpc.max_receive_message_length': -1,
      ...options,
    };
    const credentials = cert ? Grpc.credentials.createSsl(cert) : Grpc.credentials.createInsecure();

    this.url = url;
    this.Grpc = Grpc;
    this.credentials = credentials;
    this.options = opt;
    this.options.timeout ??= 10000;
  }

  async request(service: string, method: string, data?: unknown): Promise<Buffer> {
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }

    this.connections += 1;

    if (!this.client) {
      this.client = new this.Grpc.Client(this.url, this.credentials, this.options);
    }

    let error: Error | null = null;
    let result = Buffer.alloc(0);

    try {
      result = await this._request({ service, method, data });
    } catch (err) {
      error = err as Error;
    }

    this.connections -= 1;

    if (this.connections < 0) {
      this.connections = 0;
    }

    if (this.connections < 1) {
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      this._timeout = setTimeout(() => this.close(), 60000);
    }

    if (error) {
      console.log(error);
      this.close();
      throw new Error('grpc connection error.');
    }

    return result;
  }

  private _request({ service, method, data }: { service: string; method: string; data?: unknown }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      let ended = false;
      const timeout = setTimeout(() => {
        ended = true;
        this.close();

        console.log('rpc request timeout');
        reject(new Error('timeout'));
      }, this.options.timeout);

      const onResponse = (err: Error | null, res: Buffer): void => {
        if (ended) {
          return;
        }
        clearTimeout(timeout);

        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      };

      this.client!.makeUnaryRequest(
        `/${service}/${method}`,
        passThrough,
        passThrough,
        data ? Buffer.from(JSON.stringify(data)) : Buffer.alloc(0),
        onResponse,
      );
    });
  }

  close(): void {
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
    this.client?.close();
    this.client = null;
  }
}

export const GrpcList: GrpcClient[] = [];

export function createRpcClient<T>({ url, options, ServiceImp, Grpc, cert }: CreateClientProps<T>): T {
  const client = new GrpcClient({ url, options, Grpc, cert });
  GrpcList.push(client);

  return new ServiceImp({ request: client.request.bind(client) });
}
