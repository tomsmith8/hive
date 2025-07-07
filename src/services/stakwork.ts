import { HttpClient } from '@/lib/http-client';
import { config } from '@/lib/env';

export interface CreateProjectRequest {
  title: string;
  description: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
}

class StakworkService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient({
      baseURL: config.STAKWORK_BASE_URL,
      defaultHeaders: {
        'Authorization': `Bearer ${config.STAKWORK_API_KEY}`,
      },
      timeout: config.API_TIMEOUT,
    });
  }

  async createProject(project: CreateProjectRequest): Promise<any> {
    return this.client.post('/projects', project, undefined, 'stakwork');
  }
}

export const stakworkService = new StakworkService(); 