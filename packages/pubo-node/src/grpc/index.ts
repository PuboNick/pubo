interface CreateClientProps {
  url: string;
  options?: any;
  ServiceImp: any;
  Grpc: any;
  cert?: Buffer;
}

type RpcImpl = (service: string, method: string, data: Uint8Array) => Promise<Uint8Array>;

export function createRpcClient<T>({ url, options = {}, ServiceImp, Grpc, cert }: CreateClientProps): T {
  const opt = { 'grpc.max_send_message_length': -1, 'grpc.max_receive_message_length': -1, ...options };
  const credentials = cert ? Grpc.credentials.createSsl(cert) : Grpc.credentials.createInsecure();
  const connection = new Grpc.Client(url, credentials, opt);

  const request: RpcImpl = (service, method, data) => {
    const path = `/${service}/${method}`;
    return new Promise((resolve, reject) => {
      const resultCallback: any = (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      };
      const passThrough = (argument: any) => argument;
      connection.makeUnaryRequest(path, passThrough, passThrough, data, resultCallback);
    });
  };
  return new ServiceImp({ request });
}
