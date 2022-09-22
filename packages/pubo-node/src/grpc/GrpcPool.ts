import type { GrpcConfig } from './Grpc';
import { Grpc } from './Grpc';

export type GrpcPoolType = (GrpcConfig & { id })[];

export class GrpcPool {
  public static pool: GrpcPoolType = [];
  private static instance: GrpcPool | null = null;

  public static getPool = (): GrpcPool => {
    if (!this.instance) {
      this.instance = new GrpcPool(this.pool);
    }
    return this.instance;
  };

  public static setPool = (pool: GrpcPoolType) => {
    this.pool = pool;
    this.instance = new GrpcPool(this.pool);
  };

  private readonly list: { id: string; grpc: Grpc }[] = [];

  constructor(list: GrpcPoolType) {
    this.list = list.map((conf) => ({ id: conf.id, grpc: new Grpc(conf) }));
  }

  getGrpc(id: string) {
    return this.list.find((item) => item.id === id)?.grpc;
  }
}
