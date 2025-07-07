// Export Stakwork service and types
export { 
  stakworkService,
  type CreateProjectRequest
} from './stakwork';

// Export Pool Manager service and types
export { 
  poolManagerService,
  type CreatePoolRequest
} from './pool-manager';

// Export HTTP client types
export type { HttpClientConfig, ApiError } from '@/lib/http-client';

// Export a services object for easy access
import { stakworkService } from './stakwork';
import { poolManagerService } from './pool-manager';

export const services = {
  stakwork: stakworkService,
  poolManager: poolManagerService,
} as const;

// Export environment configuration
export { config } from '@/lib/env'; 