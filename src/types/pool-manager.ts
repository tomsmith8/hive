// Pool Manager-specific types and interfaces

export interface CreatePoolRequest {
  name: string;
  description?: string;
  members?: string[];
}

export interface GetPoolRequest {
  name: string;
}

export interface DeletePoolRequest {
  name: string;
}

export interface UpdatePoolRequest {
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

export interface AuthBody {
  username: string;
  password: string;
}

export interface PoolManagerAuthResponse {
  success: boolean;
  token: string;
}


