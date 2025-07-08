import { db } from '@/lib/db';
import { CreateWorkspaceRequest, WorkspaceResponse } from '@/types/workspace';

export async function createWorkspace(data: CreateWorkspaceRequest): Promise<WorkspaceResponse> {
  const workspace = await db.workspace.create({
    data: {
      name: data.name,
      description: data.description,
      slug: data.slug,
      ownerId: data.ownerId,
    },
  });
  return {
    ...workspace,
    createdAt: workspace.createdAt.toISOString(),
    updatedAt: workspace.updatedAt.toISOString(),
  };
}

export async function getWorkspaceByUserId(userId: string): Promise<WorkspaceResponse | null> {
  const workspace = await db.workspace.findFirst({
    where: { ownerId: userId },
  });
  return workspace
    ? {
        ...workspace,
        createdAt: workspace.createdAt.toISOString(),
        updatedAt: workspace.updatedAt.toISOString(),
      }
    : null;
} 