import { BaseServiceClass } from '@/lib/base-service';
import { ServiceConfig } from '@/types';
import { CreatePoolRequest, Pool } from '@/types';
import { fetchPoolEnvVars, updatePoolEnvVarsApi } from '@/services/pool-manager/api/envVars';
import { createPoolApi } from '@/services/pool-manager/api/pool';

export class PoolManagerService extends BaseServiceClass {
  public readonly serviceName = 'poolManager';

  constructor(config: ServiceConfig) {
    super(config);
  }

  async createPool(pool: CreatePoolRequest): Promise<Pool> {
    return createPoolApi(this.getClient(), pool, this.serviceName);
  }

  async getPoolEnvVars(poolName: string, poolApiKey: string) {
    return fetchPoolEnvVars(poolName, poolApiKey);
  }

  async updatePoolEnvVars(
    poolName: string,
    poolApiKey: string,
    envVars: Array<{ key: string; value: string }>,
    currentEnvVars: Array<{ key: string; value: string; masked?: boolean }>
  ) {
    return updatePoolEnvVarsApi(poolName, poolApiKey, envVars, currentEnvVars);
  }
} 