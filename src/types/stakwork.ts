// Stakwork-specific types and interfaces
export interface StakworkResponse {
    success: boolean;
    data: {
        project_id: number;
    };
}

// Payload for creating a Stakwork project
export interface StakworkProjectPayload {
<<<<<<< HEAD
    name: string;
    workflow_id: number;
    workflow_params: Record<string, unknown>;
}

export interface CreateProjectRequest {
    title: any;
    description: any;
    budget: any;
    skills: any;
    name: string;
    workflow_id: number;
    workflow_params: { set_var: { attributes: { vars: unknown } } };
}

export interface StakworkProject {
    success: boolean;
    data: {
        project_id: number;
    };
}
=======
  name: string;
  workflow_id: number;
  workflow_params: Record<string, unknown>;
}

export interface CreateCustomerResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    token: string;
  };
};
>>>>>>> c94507a (feat: setup all steps, update user creation)
