// Swarm-specific types and interfaces

export interface CreateSwarmRequest {
  vanity_address: string;
  name: string;
  instance_type: string;
  env?: Record<string, string>;
}

export interface Swarm {
  swarm_id: string;
  name: string;
  vanity_address: string;
  instance_type: string;
  env?: Record<string, string>;
}

export interface CreateSwarmResponse {
  success: boolean;
  message: string;
  data: {
    swarm_id: string;
  };
} 