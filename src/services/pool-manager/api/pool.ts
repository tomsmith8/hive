import { CreatePoolRequest, Pool } from '@/types';
import { HttpClient } from '@/lib/http-client';

export async function createPoolApi(
  client: HttpClient,
  pool: CreatePoolRequest,
  serviceName: string
): Promise<Pool> {
  return client.post<Pool>('/workspaces', pool, undefined, serviceName);
} 