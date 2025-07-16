export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  fork: boolean;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  default_branch: string;
  updated_at: string;
}

export interface EnvironmentVariable {
  key: string;
  value: string;
  show: boolean;
}

export interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  github?: {
    username?: string;
    publicRepos?: number;
    followers?: number;
  };
}

export interface CodeGraphWizardProps {
  user: User;
}

export interface WizardState {
  step: number;
  repositories: Repository[];
  selectedRepo: Repository | null;
  searchTerm: string;
  loading: boolean;
  parsedRepoName: string;
  workspaceName: string;
  envVars: EnvironmentVariable[];
}

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// Canonical wizard step keys for backend/frontend sync
export type WizardStepKey =
  | 'WELCOME'
  | 'REPOSITORY_SELECT'
  | 'PROJECT_NAME'
  | 'GRAPH_INFRASTRUCTURE'
  | 'INGEST_CODE'
  | 'ADD_SERVICES'
  | 'ENVIRONMENT_SETUP'
  | 'REVIEW_POOL_ENVIRONMENT'
  | 'STAKWORK_SETUP';

// API Response Types
export interface WizardStateResponse {
  success: boolean;
  data: {
    wizardStep: string;
    stepStatus: string;
    wizardData: Record<string, unknown>;
    swarmId?: string;
    swarmStatus?: string;
    workspaceId: string;
    workspaceSlug: string;
    workspaceName: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  };
  message?: string;
}

export interface WizardStateError {
  success: false;
  message: string;
  error?: string;
}

// Wizard Progress API Types
export interface WizardProgressRequest {
  workspaceSlug: string;
  wizardStep?: WizardStepKey;
  stepStatus?: 'PENDING' | 'STARTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  wizardData?: Record<string, unknown>;
}

export interface WizardProgressResponse {
  success: boolean;
  data?: {
    wizardStep: WizardStepKey;
    stepStatus: 'PENDING' | 'STARTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    wizardData: Record<string, unknown>;
  };
  message?: string;
  error?: string;
}

// Wizard Reset API Types
export interface WizardResetRequest {
  workspaceSlug: string;
}

export interface WizardResetResponse {
  success: boolean;
  data?: {
    wizardStep: WizardStepKey;
    stepStatus: 'PENDING' | 'STARTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    wizardData: Record<string, unknown>;
  };
  message?: string;
  error?: string;
} 