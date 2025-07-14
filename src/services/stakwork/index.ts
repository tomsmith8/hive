import { BaseServiceClass } from '@/lib/base-service';
import { ServiceConfig } from '@/types';

export class StakworkService extends BaseServiceClass {
  public readonly serviceName = 'stakwork';

  constructor(config: ServiceConfig) {
    super(config);
  }

  // Removed createProject method as stakworkRequest is now used for all requests

  /**
   * Generic helper to make requests to the Stakwork API with required headers and payload structure.
   * @param endpoint - API endpoint (e.g., '/projects')
   * @param method - HTTP method (default: 'POST')
   * @param input - Object with fields: name, workflow_id, workflow_params (with set_var/attributes/vars)
   * @returns API response as JSON
   */
  async stakworkRequest<T = unknown>(
    endpoint: string,
    input: {
      name: string;
      workflow_id: number;
      workflow_params: { set_var: { attributes: { vars: unknown } } };
    },
    method: 'POST'
  ): Promise<T> {
    // Compose headers as required by Stakwork
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Token token=${this.config.apiKey}`,
    };

    // Use the correct HTTP method
    const client = this.getClient();
    const requestFn = () => {
      return client.post<T>(endpoint, input, headers, this.serviceName);
    };

    return this.handleRequest(requestFn, `stakworkRequest ${method} ${endpoint}`);
  }
} 