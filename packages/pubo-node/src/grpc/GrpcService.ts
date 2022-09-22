import type { Grpc } from './Grpc';
import { GrpcPool } from './GrpcPool';

export interface GrpcServiceConfig {
  client: string;
  serviceName: string;
  requestType: string;
}

function createRpcPromise(fn, grpc) {
  return (...args): Promise<any> => {
    return new Promise((resolve, reject) => {
      const client = grpc.client;
      fn.call(client, ...args, function (err, response) {
        global.proto = grpc.proto;
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  };
}

export class GrpcService {
  private readonly config: GrpcServiceConfig;
  private readonly grpc?: Grpc;
  private readonly promise: (request: any) => Promise<any>;

  constructor(conf: GrpcServiceConfig) {
    this.config = conf;
    this.grpc = GrpcPool.getPool().getGrpc(this.config.client);
    if (!this.grpc || !this.grpc.client[this.config.serviceName]) {
      throw new Error(`rpc service not found:${this.config.serviceName}`);
    }
    this.promise = createRpcPromise(this.grpc.client[this.config.serviceName], this.grpc);
  }

  public serializer(requestType: string, payload: any = {}) {
    if (!this.grpc) {
      throw new Error(`rpc client not found:${this.config.client}`);
    }
    global.proto = this.grpc.proto;
    const request = new this.grpc.common[requestType]();
    for (const key of Object.keys(request.toObject())) {
      if (payload[key] !== undefined) {
        request[`set${key[0].toUpperCase()}${key.slice(1)}`](payload[key]);
      }
    }
    return request;
  }

  public async send(request?: any) {
    const res = await this.promise(this.serializer(this.config.requestType, request));
    return res.toObject();
  }
}
