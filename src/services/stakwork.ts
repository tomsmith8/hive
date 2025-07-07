import { BaseServiceClass } from '@/lib/base-service';
import { ServiceConfig } from '@/types';
import { CreateProjectRequest, StakworkProject } from '@/types';

export class StakworkService extends BaseServiceClass {
  public readonly serviceName = 'stakwork';

  constructor(config: ServiceConfig) {
    super(config);
  }

  async createProject(project: CreateProjectRequest): Promise<StakworkProject> {
    return this.handleRequest(
      () => this.getClient().post<StakworkProject>('/projects', project, undefined, this.serviceName),
      'create project'
    );
  }
} 