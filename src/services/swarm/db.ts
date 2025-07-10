import { db } from '@/lib/db';
import { Prisma, SwarmStatus } from '@prisma/client';

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
}

const select = {
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
};

export async function saveOrUpdateSwarm(params: SaveOrUpdateSwarmParams) {
  let swarm = await db.swarm.findUnique({ where: { workspaceId: params.workspaceId } });
  const data: Prisma.SwarmUpdateInput = {};
  if (params.name !== undefined) data.name = params.name;
  if (params.instanceType !== undefined) data.instanceType = params.instanceType;
  if (params.environmentVariables !== undefined) (data as any).environmentVariables = JSON.stringify(params.environmentVariables);
  if (params.status !== undefined) data.status = params.status;
  if (params.swarmUrl !== undefined) data.swarmUrl = params.swarmUrl;
  if (params.repositoryName !== undefined) (data as any).repositoryName = params.repositoryName;
  if (params.repositoryDescription !== undefined) (data as any).repositoryDescription = params.repositoryDescription;
  if (params.repositoryUrl !== undefined) (data as any).repositoryUrl = params.repositoryUrl;
  if (params.swarmApiKey !== undefined) (data as any).swarmApiKey = params.swarmApiKey;
  if (params.poolName !== undefined) (data as any).poolName = params.poolName;
  data.updatedAt = new Date();

  if (swarm) {
    swarm = await db.swarm.update({ where: { workspaceId: params.workspaceId }, data, select });
  } else {
    swarm = await db.swarm.create({
      data: {
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
      } as any,
      select,
    });
  }
  return swarm;
} 