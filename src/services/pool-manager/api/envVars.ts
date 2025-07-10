import { config } from '@/lib/env';
import { getPoolManagerApiKey } from './auth';

export async function fetchPoolEnvVars(poolName: string): Promise<Array<{ key: string; value: string }>> {
  const token = await getPoolManagerApiKey();
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
  if (!data.config || !Array.isArray(data.config.env_vars)) {
    throw new Error('Invalid response from Pool Manager API');
  }
  return data.config.env_vars.map((env: { name: string; value: string }) => ({
    key: env.name,
    value: env.value,
  }));
}

export async function updatePoolEnvVarsApi(
  poolName: string,
  envVars: Array<{ key: string; value: string }>,
  currentEnvVars: Array<{ key: string; value: string; masked?: boolean }>
): Promise<unknown> {
  const token = await getPoolManagerApiKey();
  const url = `${config.POOL_MANAGER_BASE_URL}/pools/${encodeURIComponent(poolName)}`;
  const currentMap = new Map(currentEnvVars.map(env => [env.key, env.value]));
  const envVarsForApi = envVars.map(({ key, value }) => {
    const currentValue = currentMap.get(key);
    if (currentValue === undefined) {
      return { name: key, value, masked: false };
    } else if (currentValue !== value) {
      return { name: key, value, masked: false };
    } else {
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