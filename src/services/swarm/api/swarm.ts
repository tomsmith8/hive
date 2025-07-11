import { CreateSwarmRequest, Swarm } from '@/types';
import { HttpClient } from '@/lib/http-client';
import { env } from '@/lib/env';

export async function createSwarmApi(
  client: HttpClient,
  swarm: CreateSwarmRequest,
  serviceName: string
): Promise<Swarm> {
  return client.post<Swarm>(
    '/super/new_swarm',
    swarm,
    { 'x-super-token': env.SWARM_SUPERADMIN_API_KEY as string },
    serviceName
  );
} 