interface CreateClientProps {
  url: string;
  options?: any;
  ServiceImp: any;
  Grpc: any;
  cert?: Buffer;
}

class GrpcClient {
  private readonly url: string;
  private readonly options: any;
  private readonly Grpc: any;
  private readonly credentials: any;
  private client: any;

  constructor({ url, options = {}, Grpc, cert }: any) {
    this.url = url;
    this.Grpc = Grpc;
    const opt = { 'grpc.max_send_message_length': -1, 'grpc.max_receive_message_length': -1, ...options };
    const credentials = cert ? Grpc.credentials.createSsl(cert) : Grpc.credentials.createInsecure();
    this.credentials = credentials;
    this.options = opt;
    this.options.timeout = this.options.timeout ?? 5000;
    this.client = new Grpc.Client(url, credentials, opt);
  }

  reset() {
    if (this.client) {
      this.client.close();
      delete this.client;
    }

    this.client = new this.Grpc.Client(this.url, this.credentials, this.options);
  }

  passThrough(argument) {
    return argument;
  }

  request(service, method, data) {
    const path = `/${service}/${method}`;
    let timeout: any;
    let ended = false;
    return new Promise((resolve, reject) => {
      const request = this.client.makeUnaryRequest(path, this.passThrough, this.passThrough, data, (err, res) => {
        if (ended) {
          return;
        }
        clearTimeout(timeout);

        if (err) {
          this.reset();
          reject(err);
        } else {
          resolve(res);
        }
      });

      if (this.options.timeout < 0) {
        return;
      }

      timeout = setTimeout(() => {
        ended = true;
        request.cancel();
        this.reset();
        reject(new Error('timeout'));
      }, this.options.timeout);
    });
  }
}

export function createRpcClient<T>({ url, options = {}, ServiceImp, Grpc, cert }: CreateClientProps): T {
  const client = new GrpcClient({ url, options, Grpc, cert });
  return new ServiceImp({ request: client.request.bind(client) });
}
