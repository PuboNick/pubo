export interface CreateClientProps {
  url: string;
  options?: any;
  ServiceImp: any;
  Grpc: any;
  cert?: Buffer;
}

const passThrough: any = (argument) => argument;

class GrpcClient {
  private readonly url: string;
  private readonly options: any;
  private readonly Grpc: any;
  private readonly credentials: any;
  private client: any;
  private _timeout: any;
  connections = 0;

  constructor({ url, options = {}, Grpc, cert }: any) {
    const opt = { 'grpc.max_send_message_length': -1, 'grpc.max_receive_message_length': -1, ...options };
    const credentials = cert ? Grpc.credentials.createSsl(cert) : Grpc.credentials.createInsecure();

    this.url = url;
    this.Grpc = Grpc;
    this.credentials = credentials;
    this.options = opt;
    this.options.timeout = this.options.timeout ?? 10000;

    Grpc = null;
    options = null;
    cert = null;
  }

  async request(service, method, data) {
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }

    this.connections += 1;

    if (!this.client) {
      this.client = new this.Grpc.Client(this.url, this.credentials, this.options);
    }

    let error;
    let result = Buffer.alloc(0);

    try {
      result = await this._request({ service, method, data });
    } catch (err) {
      error = err;
    }

    service = null;
    method = null;
    data = null;

    this.connections -= 1;

    if (this.connections < 0) {
      this.connections = 0;
    }

    if (this.connections < 1) {
      if (this._timeout) {
        clearTimeout(this._timeout);
        this._timeout = null;
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

  _request({ service, method, data }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      let _ended = false;
      const _timeout: any = setTimeout(() => {
        _ended = true;
        this.close();

        console.log('rpc request timeout');
        reject(new Error('timeout'));
      }, this.options.timeout);

      const onResponse: any = (err: any, res) => {
        if (_ended) {
          return;
        } else {
          clearTimeout(_timeout);
        }

        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      };

      this.client.makeUnaryRequest(
        `/${service}/${method}`,
        passThrough,
        passThrough,
        data ? Buffer.from(data) : Buffer.alloc(0),
        onResponse,
      );
    });
  }

  close() {
    if (this._timeout) {
      clearTimeout(this._timeout);
      delete this._timeout;
    }
    this.client?.close();
    this.client = null;
    delete this.client;
  }
}

export const GrpcList: GrpcClient[] = [];

export function createRpcClient<T>({ url, options = {}, ServiceImp, Grpc, cert }: CreateClientProps): T {
  const client = new GrpcClient({ url, options, Grpc, cert });
  GrpcList.push(client);

  Grpc = null;
  options = null;
  return new ServiceImp({ request: client.request.bind(client) });
}
