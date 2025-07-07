// Pool Manager-specific types and interfaces

export interface CreatePoolRequest {
  name: string;
  description?: string;
  members?: string[];
}

export interface Pool {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'archived' | 'deleted';
}


