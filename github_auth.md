1. Install Dependencies
bashCopynpm install @octokit/rest bcryptjs
npm install -D @types/bcryptjs
2. Environment Variables
envCopy# .env.local
DATABASE_URL="postgresql://..."
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"
3. GitHub OAuth Service
typescriptCopy// src/lib/github-oauth.ts
import { Octokit } from '@octokit/rest';

export interface GitHubUser {
  id: number;
  node_id: string;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  type: string;
}

export interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

export interface GitHubOrganization {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  description: string | null;
}

export class GitHubOAuthService {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
  }

  async getUser(): Promise<GitHubUser> {
    const { data } = await this.octokit.rest.users.getAuthenticated();
    return data as GitHubUser;
  }

  async getUserEmails(): Promise<GitHubEmail[]> {
    const { data } = await this.octokit.rest.users.listEmailsForAuthenticatedUser();
    return data as GitHubEmail[];
  }

  async getUserOrganizations(): Promise<GitHubOrganization[]> {
    const { data } = await this.octokit.rest.orgs.listForAuthenticatedUser();
    return data as GitHubOrganization[];
  }

  static generateAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID!,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/github/callback`,
      scope: 'read:user user:email read:org',
      state,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  static async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    refresh_token?: string;
    token_type: string;
    scope: string;
  }> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
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

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    return response.json();
  }
}
4. Database Service
typescriptCopy// src/lib/user-service.ts
import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';
import { GitHubUser, GitHubEmail, GitHubOrganization } from './github-oauth';

const prisma = new PrismaClient();

export interface CreateUserFromGitHubParams {
  githubUser: GitHubUser;
  emails: GitHubEmail[];
  organizations: GitHubOrganization[];
  accessToken: string;
  refreshToken?: string;
  scopes: string[];
}

export class UserService {
  static async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 12);
  }

  static async verifyToken(token: string, hash: string): Promise<boolean> {
    return bcrypt.compare(token, hash);
  }

  static async findOrCreateUserFromGitHub({
    githubUser,
    emails,
    organizations,
    accessToken,
    refreshToken,
    scopes,
  }: CreateUserFromGitHubParams) {
    const providerId = githubUser.id.toString();
    const primaryEmail = emails.find(e => e.primary)?.email || githubUser.email;

    // Check if user already exists
    const existingAuth = await prisma.userAuth.findUnique({
      where: {
        provider_providerId: {
          provider: 'GITHUB',
          providerId,
        },
      },
      include: {
        user: true,
        githubAuth: true,
      },
    });

    if (existingAuth) {
      // Update existing user
      return await this.updateExistingGitHubUser({
        userAuth: existingAuth,
        githubUser,
        emails,
        organizations,
        accessToken,
        refreshToken,
        scopes,
      });
    }

    // Create new user
    return await this.createNewGitHubUser({
      githubUser,
      emails,
      organizations,
      accessToken,
      refreshToken,
      scopes,
      primaryEmail,
    });
  }

  private static async createNewGitHubUser({
    githubUser,
    emails,
    organizations,
    accessToken,
    refreshToken,
    scopes,
    primaryEmail,
  }: CreateUserFromGitHubParams & { primaryEmail: string | null }) {
    const accessTokenHash = await this.hashToken(accessToken);
    const refreshTokenHash = refreshToken ? await this.hashToken(refreshToken) : null;
    const organizationsHash = organizations.length > 0 
      ? await this.hashToken(JSON.stringify(organizations))
      : null;

    const user = await prisma.user.create({
      data: {
        name: githubUser.name,
        email: primaryEmail,
        avatar: githubUser.avatar_url,
        emailVerified: emails.find(e => e.primary)?.verified ? new Date() : null,
        lastLoginAt: new Date(),
        authMethods: {
          create: {
            provider: 'GITHUB',
            providerId: githubUser.id.toString(),
            email: primaryEmail,
            username: githubUser.login,
            displayName: githubUser.name,
            avatar: githubUser.avatar_url,
            accessTokenHash,
            refreshTokenHash,
            tokenExpiresAt: null, // GitHub tokens don't expire
            tokenCreatedAt: new Date(),
            lastUsedAt: new Date(),
            githubAuth: {
              create: {
                githubUserId: githubUser.id.toString(),
                githubUsername: githubUser.login,
                githubNodeId: githubUser.node_id,
                name: githubUser.name,
                bio: githubUser.bio,
                company: githubUser.company,
                location: githubUser.location,
                blog: githubUser.blog,
                twitterUsername: githubUser.twitter_username,
                publicRepos: githubUser.public_repos,
                publicGists: githubUser.public_gists,
                followers: githubUser.followers,
                following: githubUser.following,
                githubCreatedAt: new Date(githubUser.created_at),
                githubUpdatedAt: new Date(githubUser.updated_at),
                accountType: githubUser.type,
                scopes,
                organizationsHash,
              },
            },
          },
        },
      },
      include: {
        authMethods: {
          include: {
            githubAuth: true,
          },
        },
      },
    });

    return user;
  }

  private static async updateExistingGitHubUser({
    userAuth,
    githubUser,
    emails,
    organizations,
    accessToken,
    refreshToken,
    scopes,
  }: {
    userAuth: any;
    githubUser: GitHubUser;
    emails: GitHubEmail[];
    organizations: GitHubOrganization[];
    accessToken: string;
    refreshToken?: string;
    scopes: string[];
  }) {
    const primaryEmail = emails.find(e => e.primary)?.email || githubUser.email;
    const accessTokenHash = await this.hashToken(accessToken);
    const refreshTokenHash = refreshToken ? await this.hashToken(refreshToken) : null;
    const organizationsHash = organizations.length > 0 
      ? await this.hashToken(JSON.stringify(organizations))
      : null;

    // Update user
    await prisma.user.update({
      where: { id: userAuth.userId },
      data: {
        name: githubUser.name,
        email: primaryEmail,
        avatar: githubUser.avatar_url,
        emailVerified: emails.find(e => e.primary)?.verified ? new Date() : null,
        lastLoginAt: new Date(),
      },
    });

    // Update auth
    await prisma.userAuth.update({
      where: { id: userAuth.id },
      data: {
        email: primaryEmail,
        username: githubUser.login,
        displayName: githubUser.name,
        avatar: githubUser.avatar_url,
        accessTokenHash,
        refreshTokenHash,
        tokenCreatedAt: new Date(),
        lastUsedAt: new Date(),
        loginAttempts: 0, // Reset on successful login
        lockedUntil: null,
      },
    });

    // Update GitHub auth
    await prisma.gitHubAuth.update({
      where: { userAuthId: userAuth.id },
      data: {
        githubUsername: githubUser.login,
        githubNodeId: githubUser.node_id,
        name: githubUser.name,
        bio: githubUser.bio,
        company: githubUser.company,
        location: githubUser.location,
        blog: githubUser.blog,
        twitterUsername: githubUser.twitter_username,
        publicRepos: githubUser.public_repos,
        publicGists: githubUser.public_gists,
        followers: githubUser.followers,
        following: githubUser.following,
        githubUpdatedAt: new Date(githubUser.updated_at),
        accountType: githubUser.type,
        scopes,
        organizationsHash,
      },
    });

    return await prisma.user.findUnique({
      where: { id: userAuth.userId },
      include: {
        authMethods: {
          include: {
            githubAuth: true,
          },
        },
      },
    });
  }

  static async createSession(userId: string, userAgent?: string, ipAddress?: string) {
    // Generate a secure session token
    const sessionToken = await bcrypt.hash(`${userId}-${Date.now()}-${Math.random()}`, 12);
    
    const session = await prisma.session.create({
      data: {
        userId,
        sessionToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        userAgent,
        ipAddress,
      },
    });

    return session;
  }

  static async getSessionWithUser(sessionToken: string) {
    return await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          include: {
            authMethods: {
              include: {
                githubAuth: true,
              },
            },
          },
        },
      },
    });
  }

  static async deleteSession(sessionToken: string) {
    await prisma.session.delete({
      where: { sessionToken },
    });
  }
}
5. API Routes
typescriptCopy// src/app/api/auth/github/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GitHubOAuthService } from '@/lib/github-oauth';

export async function GET(request: NextRequest) {
  const state = crypto.randomUUID();
  const authUrl = GitHubOAuthService.generateAuthUrl(state);
  
  const response = NextResponse.redirect(authUrl);
  response.cookies.set('github_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
  });
  
  return response;
}
typescriptCopy// src/app/api/auth/github/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GitHubOAuthService } from '@/lib/github-oauth';
import { UserService } from '@/lib/user-service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/auth/error?error=${error}`, request.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/auth/error?error=missing_parameters', request.url));
  }

  // Verify state
  const cookieState = request.cookies.get('github_oauth_state')?.value;
  if (state !== cookieState) {
    return NextResponse.redirect(new URL('/auth/error?error=invalid_state', request.url));
  }

  try {
    // Exchange code for access token
    const tokenResponse = await GitHubOAuthService.exchangeCodeForToken(code);
    
    // Get user data from GitHub
    const githubService = new GitHubOAuthService(tokenResponse.access_token);
    const [githubUser, emails, organizations] = await Promise.all([
      githubService.getUser(),
      githubService.getUserEmails(),
      githubService.getUserOrganizations(),
    ]);

    // Create or update user in database
    const user = await UserService.findOrCreateUserFromGitHub({
      githubUser,
      emails,
      organizations,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      scopes: tokenResponse.scope.split(','),
    });

    // Create session
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     undefined;
    
    const session = await UserService.createSession(user.id, userAgent, ipAddress);

    // Set session cookie
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.cookies.set('session_token', session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    // Clear state cookie
    response.cookies.delete('github_oauth_state');

    return response;
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return NextResponse.redirect(new URL('/auth/error?error=oauth_failed', request.url));
  }
}
6. Middleware for Session Management
typescriptCopy// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/user-service';

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token')?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    const session = await UserService.getSessionWithUser(sessionToken);
    
    if (!session || session.expiresAt < new Date()) {
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('session_token');
      return response;
    }

    // Add user info to request headers for use in components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', session.user.id);
    requestHeaders.set('x-user-email', session.user.email || '');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Session validation error:', error);
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('session_token');
    return response;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    // Add other protected routes
  ],
};
7. Login Component
typescriptCopy// src/components/LoginButton.tsx
'use client';

export default function LoginButton() {
  const handleGitHubLogin = () => {
    window.location.href = '/api/auth/github';
  };

  return (
    <button
      onClick={handleGitHubLogin}
      className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
      </svg>
      Login with GitHub
    </button>
  );
}
8. Usage Example
typescriptCopy// src/app/dashboard/page.tsx
import { headers } from 'next/headers';
import { UserService } from '@/lib/user-service';

export default async function Dashboard() {
  const headersList = headers();
  const userId = headersList.get('x-user-id');
  
  if (!userId) {
    return <div>Unauthorized</div>;
  }

  // Get user data from session or database
  const sessionToken = headersList.get('cookie')?.split('session_token=')[1]?.split(';')[0];
  const session = sessionToken ? await UserService.getSessionWithUser(sessionToken) : null;

  return (
    <div>
      <h1>Welcome, {session?.user.name || 'User'}!</h1>
      <p>Email: {session?.user.email}</p>
      <p>GitHub: @{session?.user.authMethods[0]?.githubAuth?.githubUsername}</p>
    </div>
  );
}
This implementation provides:

Complete GitHub OAuth flow
Secure token hashing (no plain text storage)
Session management
User creation and updates
Protected routes with middleware
Error handling
TypeScript support

The system handles both new user creation and existing user updates, stores all relevant GitHub data, and provides a secure session-based authentication system.