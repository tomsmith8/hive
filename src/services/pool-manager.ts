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
    // Always return the value, regardless of masked
    if (!data.config || !Array.isArray(data.config.env_vars)) {
      throw new Error('Invalid response from Pool Manager API');
    }
    return data.config.env_vars.map((env: { name: string; value: string }) => ({
      key: env.name,
      value: env.value,
    }));
  }

  /**
   * Updates environment variables for a pool in the Pool Manager API.
   * Always sends all env vars. For changed values, sends masked: false and the new value; for unchanged, sends masked: true and the masked value.
   * @param poolName The name of the pool.
   * @param envVars Array of { key, value } objects (the desired state).
   * @param currentEnvVars Array of { key, value, masked } objects (the current state from Pool Manager).
   */
  async updatePoolEnvVars(
    poolName: string,
    envVars: Array<{ key: string; value: string }>,
    currentEnvVars: Array<{ key: string; value: string; masked?: boolean }>
  ): Promise<unknown> {
    const token = await this.getPoolManagerApiKey();
    const url = `${config.POOL_MANAGER_BASE_URL}/pools/${encodeURIComponent(poolName)}`;
    // Create a map of current env vars for comparison
    const currentMap = new Map(currentEnvVars.map(env => [env.key, env.value]));
    const envVarsForApi = envVars.map(({ key, value }) => {
      const currentValue = currentMap.get(key);
      if (currentValue === undefined) {
        // New var
        return { name: key, value, masked: false };
      } else if (currentValue !== value) {
        // Changed var
        return { name: key, value, masked: false };
      } else {
        // Unchanged var, send masked:true and masked value
        return { name: key, value, masked: true };
      }
    });
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