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