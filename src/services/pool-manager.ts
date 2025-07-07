import { BaseServiceClass } from '@/lib/base-service';
import { ServiceConfig } from '@/types';
import { CreatePoolRequest, Pool } from '@/types';

export class PoolManagerService extends BaseServiceClass {
  public readonly serviceName = 'poolManager';

  constructor(config: ServiceConfig) {
    super(config);
  }

  async createPool(pool: CreatePoolRequest): Promise<Pool> {
    return this.handleRequest(
      () => this.getClient().post<Pool>('/workspaces', pool, undefined, this.serviceName),
      'create pool'
    );
  }
} 