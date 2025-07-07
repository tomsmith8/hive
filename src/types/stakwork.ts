// Stakwork-specific types and interfaces

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

export interface StakworkProject {
  id: string;
  title: string;
  description: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}
