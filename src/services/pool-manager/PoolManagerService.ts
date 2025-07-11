import { BaseServiceClass } from '@/lib/base-service';
import { ServiceConfig } from '@/types';
import { CreatePoolRequest, Pool } from '@/types';
import { getPoolManagerApiKey } from './api/auth';
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

  async getPoolManagerApiKey(): Promise<string> {
    return getPoolManagerApiKey();
  }

  async getPoolEnvVars(poolName: string): Promise<Array<{ key: string; value: string }>> {
    return fetchPoolEnvVars(poolName);
  }

  async updatePoolEnvVars(
    poolName: string,
    envVars: Array<{ key: string; value: string }>,
    currentEnvVars: Array<{ key: string; value: string; masked?: boolean }>
  ): Promise<unknown> {
    return updatePoolEnvVarsApi(poolName, envVars, currentEnvVars);
  }
} 