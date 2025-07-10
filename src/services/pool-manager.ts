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

  /**
   * Fetches environment variables for a pool from the Pool Manager API.
   * @param poolName The name of the pool.
   */
  async getPoolEnvVars(poolName: string): Promise<Array<{ key: string; value: string }>> {
    const token = await this.getPoolManagerApiKey();
    const url = `${config.POOL_MANAGER_BASE_URL}/pools/${encodeURIComponent(poolName)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch pool env vars: ${response.status}`);
    }
    const data = await response.json();
    // Expecting data.config.env_vars as per API
    if (!data.config || !Array.isArray(data.config.env_vars)) {
      throw new Error('Invalid response from Pool Manager API');
    }
    // Convert env_vars to { key, value }[]; if masked, value is ''
    return data.config.env_vars.map((env: { name: string; value: string; masked?: boolean }) => ({
      key: env.name,
      value: env.masked ? '' : env.value,
    }));
  }

  /**
   * Updates environment variables for a pool in the Pool Manager API.
   * @param poolName The name of the pool.
   * @param envVars Array of { key, value } objects.
   */
  async updatePoolEnvVars(poolName: string, envVars: Array<{ key: string; value: string }>): Promise<unknown> {
    const token = await this.getPoolManagerApiKey();
    const url = `${config.POOL_MANAGER_BASE_URL}/pools/${encodeURIComponent(poolName)}`;
    // Transform to [{ name, value, masked }]
    const envVarsForApi = envVars.map(({ key, value }) => ({ name: key, value, masked: false }));
    const body = JSON.stringify({ env_vars: envVarsForApi });
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body,
    });
    if (!response.ok) {
      throw new Error(`Failed to update pool env vars: ${response.status}`);
    }
    return response.json();
  }
} 