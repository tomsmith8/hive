export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  slug: string;
  ownerId: string;
}

export interface WorkspaceResponse {
  id: string;
  name: string;
  description?: string | null;
  slug: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
} 