import { BaseServiceClass } from '@/lib/base-service';
import { ServiceConfig } from '@/types';
import { CreatePoolRequest, Pool } from '@/types';
import { AuthBody, PoolManagerAuthResponse } from '@/types/pool-manager';
import { config } from '@/lib/env';

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

  /**
   * Authenticates with the Pool Manager API and retrieves a JWT token.
   * Throws an error if authentication fails or the response is invalid.
   */
  async getPoolManagerApiKey(): Promise<string> {
    const url = `${config.POOL_MANAGER_BASE_URL}/auth/login`;
    const body: AuthBody = {
      username: config.POOL_MANAGER_API_USERNAME!,
      password: config.POOL_MANAGER_API_PASSWORD!,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Unexpected status code: ${response.status}`);
    }

    const data = (await response.json()) as PoolManagerAuthResponse;
    if (!data.success) {
      throw new Error('Authentication failed');
    }
    return data.token;
  }
} 