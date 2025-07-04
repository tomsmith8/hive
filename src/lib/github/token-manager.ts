import { prisma } from '@/lib/db';

// ============================================================================
// GITHUB TOKEN MANAGEMENT
// ============================================================================

// GitHub OAuth tokens don't expire by default, but we'll set a reasonable expiry
// for security purposes (e.g., 1 year)
const GITHUB_TOKEN_EXPIRY_DAYS = 365;

export interface GitHubTokenInfo {
  token: string;
  expiresAt: Date | null;
  createdAt: Date | null;
  isExpired: boolean;
  daysUntilExpiry: number | null;
}

/**
 * Store a GitHub token with expiry information
 * @param userId - The user ID
 * @param token - The GitHub OAuth token
 * @returns Promise<void>
 */
export async function storeGitHubToken(userId: string, token: string): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + GITHUB_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      githubToken: token,
      githubTokenCreatedAt: now,
      githubTokenExpiresAt: expiresAt,
    },
  });
}

/**
 * Get GitHub token information for a user
 * @param userId - The user ID
 * @returns Promise<GitHubTokenInfo | null>
 */
export async function getGitHubTokenInfo(userId: string): Promise<GitHubTokenInfo | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      githubToken: true,
      githubTokenExpiresAt: true,
      githubTokenCreatedAt: true,
    },
  });

  if (!user || !user.githubToken) {
    return null;
  }

  const now = new Date();
  const isExpired = user.githubTokenExpiresAt ? now > user.githubTokenExpiresAt : false;
  const daysUntilExpiry = user.githubTokenExpiresAt 
    ? Math.ceil((user.githubTokenExpiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    : null;

  return {
    token: user.githubToken,
    expiresAt: user.githubTokenExpiresAt,
    createdAt: user.githubTokenCreatedAt,
    isExpired,
    daysUntilExpiry,
  };
}

/**
 * Check if a GitHub token is expired or will expire soon
 * @param userId - The user ID
 * @param warningDays - Number of days before expiry to warn (default: 30)
 * @returns Promise<{ isExpired: boolean; isExpiringSoon: boolean; daysUntilExpiry: number | null }>
 */
export async function checkGitHubTokenStatus(
  userId: string, 
  warningDays: number = 30
): Promise<{ isExpired: boolean; isExpiringSoon: boolean; daysUntilExpiry: number | null }> {
  const tokenInfo = await getGitHubTokenInfo(userId);
  
  if (!tokenInfo) {
    return { isExpired: true, isExpiringSoon: false, daysUntilExpiry: null };
  }

  const isExpired = tokenInfo.isExpired;
  const isExpiringSoon = tokenInfo.daysUntilExpiry !== null && 
                        tokenInfo.daysUntilExpiry <= warningDays && 
                        tokenInfo.daysUntilExpiry > 0;

  return {
    isExpired,
    isExpiringSoon,
    daysUntilExpiry: tokenInfo.daysUntilExpiry,
  };
}

/**
 * Refresh a GitHub token (in this case, we'll just update the expiry)
 * @param userId - The user ID
 * @returns Promise<boolean> - True if successful, false if no token found
 */
export async function refreshGitHubToken(userId: string): Promise<boolean> {
  const tokenInfo = await getGitHubTokenInfo(userId);
  
  if (!tokenInfo) {
    return false;
  }

  // Update the expiry date
  const now = new Date();
  const newExpiresAt = new Date(now.getTime() + GITHUB_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      githubTokenExpiresAt: newExpiresAt,
    },
  });

  return true;
}

/**
 * Remove GitHub token and related data
 * @param userId - The user ID
 * @returns Promise<void>
 */
export async function removeGitHubToken(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      githubToken: null,
      githubTokenExpiresAt: null,
      githubTokenCreatedAt: null,
      githubUsername: null,
      githubUserId: null,
      githubOrganizations: undefined,
    },
  });
}

/**
 * Get all users with expired GitHub tokens
 * @returns Promise<Array<{ userId: string; username: string; expiresAt: Date }>>
 */
export async function getUsersWithExpiredTokens(): Promise<Array<{ userId: string; username: string; expiresAt: Date }>> {
  const now = new Date();
  
  const users = await prisma.user.findMany({
    where: {
      githubToken: { not: null },
      githubTokenExpiresAt: { lt: now },
    },
    select: {
      id: true,
      githubUsername: true,
      githubTokenExpiresAt: true,
    },
  });

  return users.map(user => ({
    userId: user.id,
    username: user.githubUsername || 'Unknown',
    expiresAt: user.githubTokenExpiresAt!,
  }));
}

/**
 * Get all users with tokens expiring soon
 * @param days - Number of days to check ahead (default: 30)
 * @returns Promise<Array<{ userId: string; username: string; expiresAt: Date; daysUntilExpiry: number }>>
 */
export async function getUsersWithExpiringTokens(days: number = 30): Promise<Array<{ userId: string; username: string; expiresAt: Date; daysUntilExpiry: number }>> {
  const now = new Date();
  const warningDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  const users = await prisma.user.findMany({
    where: {
      githubToken: { not: null },
      githubTokenExpiresAt: {
        gte: now,
        lte: warningDate,
      },
    },
    select: {
      id: true,
      githubUsername: true,
      githubTokenExpiresAt: true,
    },
  });

  return users.map(user => ({
    userId: user.id,
    username: user.githubUsername || 'Unknown',
    expiresAt: user.githubTokenExpiresAt!,
    daysUntilExpiry: Math.ceil((user.githubTokenExpiresAt!.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
  }));
} 