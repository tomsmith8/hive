import { db } from '@/lib/db';
import { CreateWorkspaceRequest, WorkspaceResponse } from '@/types/workspace';

export async function createWorkspace(data: CreateWorkspaceRequest): Promise<WorkspaceResponse> {
  // Check if the slug already exists
  const existing = await db.workspace.findUnique({ where: { slug: data.slug } });
  if (existing) {
    throw new Error('A workspace with this slug already exists. Please choose a different name or slug.');
  }
  try {
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
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      throw new Error('A workspace with this slug already exists. Please choose a different name or slug.');
    }
    throw error;
  }
}

export async function getWorkspacesByUserId(userId: string): Promise<WorkspaceResponse[]> {
  const workspaces = await db.workspace.findMany({
    where: { ownerId: userId },
  });
  return workspaces.map(workspace => ({
    ...workspace,
    createdAt: workspace.createdAt.toISOString(),
    updatedAt: workspace.updatedAt.toISOString(),
  }));
} 