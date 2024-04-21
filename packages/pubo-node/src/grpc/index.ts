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
    const opt = { 'grpc.max_send_message_length': -1, 'grpc.max_receive_message_length': -1, ...options };
    const credentials = cert ? Grpc.credentials.createSsl(cert) : Grpc.credentials.createInsecure();

    this.url = url;
    this.Grpc = Grpc;
    this.credentials = credentials;
    this.options = opt;
    this.options.timeout = this.options.timeout ?? 5000;
  }

  private passThrough(argument) {
    return argument;
  }

  reset() {
    if (!this.client) {
      return;
    }

    this.client.close();
    this.client = null;
  }

  request(service, method, data) {
    const path = `/${service}/${method}`;
    if (!this.client) {
      this.client = new this.Grpc.Client(this.url, this.credentials, this.options);
    }

    return new Promise((resolve, reject) => {
      this.client.makeUnaryRequest(path, this.passThrough, this.passThrough, data, (err, res) => {
        if (err) {
          this.reset();
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }
}

export function createRpcClient<T>({ url, options = {}, ServiceImp, Grpc, cert }: CreateClientProps): T {
  const client = new GrpcClient({ url, options, Grpc, cert });
  return new ServiceImp({ request: client.request.bind(client) });
}
