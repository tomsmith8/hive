export interface GitHubUser {
  id: number;
  login: string;
  name?: string;
  avatar_url?: string;
  email?: string;
}

export interface GitHubOrganization {
  id: number;
  login: string;
  name?: string;
  avatar_url?: string;
  description?: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description?: string;
  language?: string;
  updated_at: string;
  permissions?: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
}

export class GitHubService {
  private static readonly GITHUB_API_BASE = 'https://api.github.com';
  private static readonly GITHUB_OAUTH_BASE = 'https://github.com/login/oauth';

  static getOAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID!,
      scope: 'repo read:org',
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/github/callback`,
    });

    if (state) {
      params.append('state', state);
    }

    return `${this.GITHUB_OAUTH_BASE}/authorize?${params.toString()}`;
  }

  static async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch(`${this.GITHUB_OAUTH_BASE}/access_token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
    }

    return data.access_token;
  }

  static async getUser(token: string): Promise<GitHubUser> {
    const response = await fetch(`${this.GITHUB_API_BASE}/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch GitHub user: ${response.statusText}`);
    }

    return response.json();
  }

  static async getUserOrganizations(token: string): Promise<GitHubOrganization[]> {
    const response = await fetch(`${this.GITHUB_API_BASE}/user/orgs`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch GitHub organizations: ${response.statusText}`);
    }

    return response.json();
  }

  static async getOrganizationRepositories(
    token: string,
    org: string
  ): Promise<GitHubRepository[]> {
    const response = await fetch(`${this.GITHUB_API_BASE}/orgs/${org}/repos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch repositories for ${org}: ${response.statusText}`);
    }

    return response.json();
  }

  static async getUserRepositories(token: string): Promise<GitHubRepository[]> {
    const response = await fetch(`${this.GITHUB_API_BASE}/user/repos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user repositories: ${response.statusText}`);
    }

    return response.json();
  }
} 