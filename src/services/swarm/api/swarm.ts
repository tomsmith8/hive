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

export async function fetchSwarmStats(swarmUrl: string): Promise<{ ok: boolean; data?: unknown; status: number }> {
  try {
    const response = await fetch(`${swarmUrl}/stats`, { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data, status: response.status };
  } catch {
    return { ok: false, status: 500 };
  }
}

export async function swarmApiRequest({
  swarmUrl,
  endpoint,
  method = 'GET',
  apiKey,
  data
}: {
  swarmUrl: string;
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  apiKey: string;
  data?: unknown;
}): Promise<{ ok: boolean; data?: unknown; status: number }> {
  try {
    const url = `${swarmUrl.replace(/\/$/, '')}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers: Record<string, string> = {
      'x-api-token': apiKey,
      'Content-Type': 'application/json',
    };
    const response = await fetch(url, {
      method,
      headers,
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
    let responseData: unknown = undefined;
    try {
      responseData = await response.json();
    } catch {}
    return { ok: response.ok, data: responseData, status: response.status };
  } catch {
    return { ok: false, status: 500 };
  }
} 