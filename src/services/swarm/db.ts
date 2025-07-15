import { db } from '@/lib/db';
import { SwarmStatus } from '@prisma/client';

// Add ServiceConfig interface for the services array
export interface ServiceConfig {
  name: string;
  port: number;
  scripts: {
    start: string;
    install?: string;
    build?: string;
    test?: string;
  };
}

interface SaveOrUpdateSwarmParams {
  workspaceId: string;
  name?: string; // domain name (vanity_address)
  instanceType?: string;
  environmentVariables?: Record<string, string>;
  status?: SwarmStatus;
  swarmUrl?: string;
  repositoryName?: string;
  repositoryDescription?: string;
  repositoryUrl?: string;
  swarmApiKey?: string;
  poolName?: string;
  poolApiKey?: string; // NEW FIELD
  services?: ServiceConfig[]; // Use ServiceConfig[]
  swarmId?: string;
  swarmSecretAlias?: string;
}

export const select = {
  id: true,
  name: true,
  swarmUrl: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  workspaceId: true,
  instanceType: true,
  repositoryName: true,
  repositoryDescription: true,
  repositoryUrl: true,
  swarmApiKey: true,
  poolName: true,
  poolApiKey: true, // NEW FIELD
  services: true,
  swarmSecretAlias: true,
};

export async function saveOrUpdateSwarm(params: SaveOrUpdateSwarmParams) {
  let swarm = await db.swarm.findUnique({ where: { workspaceId: params.workspaceId } });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {};
  if (params.name !== undefined) data.name = params.name;
  if (params.instanceType !== undefined) data.instanceType = params.instanceType;
  if (params.environmentVariables !== undefined) data.environmentVariables = JSON.stringify(params.environmentVariables);
  if (params.status !== undefined) data.status = params.status;
  if (params.swarmUrl !== undefined) data.swarmUrl = params.swarmUrl;
  if (params.repositoryName !== undefined) data.repositoryName = params.repositoryName;
  if (params.repositoryDescription !== undefined) data.repositoryDescription = params.repositoryDescription;
  if (params.repositoryUrl !== undefined) data.repositoryUrl = params.repositoryUrl;
  if (params.swarmApiKey !== undefined) data.swarmApiKey = params.swarmApiKey;
  if (params.poolName !== undefined) data.poolName = params.poolName;
  if (params.poolApiKey !== undefined) data.poolApiKey = params.poolApiKey;
  if (params.swarmId !== undefined) data.swarmId = params.swarmId;
  if (params.swarmSecretAlias !== undefined) data.swarmSecretAlias = params.swarmSecretAlias;
  if (params.services !== undefined) {
    console.log("[saveOrUpdateSwarm] Saving services:", params.services);
    data.services = params.services;
  }
  data.updatedAt = new Date();

  if (swarm) {
    console.log("[saveOrUpdateSwarm] Update data:", data);
    swarm = await db.swarm.update({ where: { workspaceId: params.workspaceId }, data, select });
  } else {
    const createData = {
        workspaceId: params.workspaceId,
        name: params.name || '',
        instanceType: params.instanceType || '',
        environmentVariables: params.environmentVariables ? JSON.stringify(params.environmentVariables) : '[]',
        status: params.status || SwarmStatus.PENDING,
        swarmUrl: params.swarmUrl || null,
        repositoryName: params.repositoryName || '',
        repositoryDescription: params.repositoryDescription || '',
        repositoryUrl: params.repositoryUrl || '',
        swarmApiKey: params.swarmApiKey || '',
        poolName: params.poolName || '',
        poolApiKey: params.poolApiKey || '', // NEW FIELD
        services: params.services ? params.services : [],
        swarmSecretAlias: params.swarmSecretAlias || ''
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    console.log("[saveOrUpdateSwarm] Create data:", createData);
    swarm = await db.swarm.create({
      data: createData,
      select,
    });
  }
  return swarm;
} 