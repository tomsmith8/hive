import { HttpClient } from '@/lib/http-client';
import { config } from '@/lib/env';

export interface CreatePoolRequest {
  name: string;
  description?: string;
  members?: string[];
}

class PoolManagerService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient({
      baseURL: config.POOL_MANAGER_BASE_URL,
      defaultHeaders: {
        'Authorization': `Bearer ${config.POOL_MANAGER_API_KEY}`,
      },
      timeout: config.API_TIMEOUT,
    });
  }

  async createPool(pool: CreatePoolRequest): Promise<any> {
    return this.client.post('/workspaces', pool, undefined, 'pool-manager');
  }
}

export const poolManagerService = new PoolManagerService(); 