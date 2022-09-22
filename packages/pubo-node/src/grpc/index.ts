import { superFactory } from 'pubo-utils';

import { GrpcService } from './GrpcService';

interface GrpcServiceOptions {
  client: string;
  requestType: string;
  service?: string;
}

export const createGrpcService = superFactory<GrpcServiceOptions, GrpcService>((config, key) => {
  return new GrpcService({ ...config, serviceName: config.service || key });
});
