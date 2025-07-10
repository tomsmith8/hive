import { db } from '@/lib/db';
import { CreateWorkspaceRequest, WorkspaceResponse } from '@/types/workspace';
import { RESERVED_WORKSPACE_SLUGS, WORKSPACE_SLUG_PATTERNS, WORKSPACE_ERRORS } from '@/lib/constants';

// Existing functions
export async function createWorkspace(data: CreateWorkspaceRequest): Promise<WorkspaceResponse> {
  // Validate the slug before creating
  const slugValidation = validateWorkspaceSlug(data.slug);
  if (!slugValidation.isValid) {
    throw new Error(slugValidation.error!);
  }

  // Check if the slug already exists
  const existing = await db.workspace.findUnique({ where: { slug: data.slug } });
  if (existing) {
    throw new Error(WORKSPACE_ERRORS.SLUG_ALREADY_EXISTS);
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
      throw new Error(WORKSPACE_ERRORS.SLUG_ALREADY_EXISTS);
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

/**
 * Gets a workspace by slug if user has access (owner or member)
 */
export async function getWorkspaceBySlug(slug: string, userId: string): Promise<WorkspaceResponse | null> {
  // First check if user owns the workspace
  const ownedWorkspace = await db.workspace.findFirst({
    where: { 
      slug,
      ownerId: userId
    }
  });

  if (ownedWorkspace) {
    return {
      ...ownedWorkspace,
      createdAt: ownedWorkspace.createdAt.toISOString(),
      updatedAt: ownedWorkspace.updatedAt.toISOString(),
    };
  }

  // TODO: Add member check when workspace membership is needed
  // For now, only return workspaces the user owns
  return null;
}

// New enhanced functions

/**
 * Validates a workspace slug against reserved words and format requirements
 */
export function validateWorkspaceSlug(slug: string): { isValid: boolean; error?: string } {
  // Check length
  if (slug.length < WORKSPACE_SLUG_PATTERNS.MIN_LENGTH || slug.length > WORKSPACE_SLUG_PATTERNS.MAX_LENGTH) {
    return { isValid: false, error: WORKSPACE_ERRORS.SLUG_INVALID_LENGTH };
  }

  // Check format (lowercase alphanumeric with hyphens, start/end with alphanumeric)
  if (!WORKSPACE_SLUG_PATTERNS.VALID.test(slug)) {
    return { isValid: false, error: WORKSPACE_ERRORS.SLUG_INVALID_FORMAT };
  }

  // Check against reserved slugs
  if (RESERVED_WORKSPACE_SLUGS.includes(slug as any)) {
    return { isValid: false, error: WORKSPACE_ERRORS.SLUG_RESERVED };
  }

  return { isValid: true };
} 