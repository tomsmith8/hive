import { CreateSwarmRequest, Swarm } from '@/types';
import { HttpClient } from '@/lib/http-client';

export async function createSwarmApi(
  client: HttpClient,
  swarm: CreateSwarmRequest,
  serviceName: string
): Promise<Swarm> {
  return client.post<Swarm>('/super/new_swarm', swarm, undefined, serviceName);
} 