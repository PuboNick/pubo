import * as grpc from 'grpc';

export interface GrpcConfig {
  root: string;
  url: string;
  options?: any;
}

export class Grpc {
  private readonly config: GrpcConfig;
  private readonly options = {
    'grpc.max_send_message_length': -1,
    'grpc.max_receive_message_length': -1,
  };
  private instance: any = null;
  private readonly RpcClient: any;

  public common: any;
  public proto: any;

  constructor(conf: GrpcConfig) {
    this.config = conf;
    this.common = require(`${this.config.root}/common_pb`);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    this.RpcClient = require(`${this.config.root}/service_grpc_pb`).RpcClient;
    this.proto = global.proto;
    global.proto = {};
  }

  get client() {
    if (!this.instance) {
      const options = { ...this.options, ...(this.config.options || {}) };
      this.instance = new this.RpcClient(this.config.url, grpc.credentials.createInsecure(), options);
    }
    return this.instance;
  }
}
