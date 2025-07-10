import { BaseServiceClass } from '@/lib/base-service';
import { ServiceConfig } from '@/types';
import { CreateSwarmRequest, Swarm } from '@/types';
import { createSwarmApi } from './api/swarm';

export class SwarmService extends BaseServiceClass {
  public readonly serviceName = 'swarm';

  constructor(config: ServiceConfig) {
    super(config);
  }

  async createSwarm(swarm: CreateSwarmRequest): Promise<Swarm> {
    return createSwarmApi(this.getClient(), swarm, this.serviceName);
  }
} 