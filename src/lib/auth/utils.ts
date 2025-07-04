import { NextRequest } from 'next/server';
import { verifyJWT } from './jwt';
import { getAuthToken } from '@/middleware/auth';

// ============================================================================
// AUTH UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract the current authenticated user from a Next.js request
 * @param request - The Next.js request object
 * @returns The authenticated user or null if not authenticated
 */
export function getCurrentUser(request: NextRequest) {
  const token = getAuthToken(request);
  
  if (!token) {
    return null;
  }

  return verifyJWT(token);
}

/**
 * Generate a secure state parameter for OAuth flows
 * @param userId - The user ID to include in the state
 * @returns A secure state string
 */
export function generateOAuthState(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const state = `${userId}:${timestamp}:${random}`;
  
  // In a production environment, you might want to encrypt this
  // or use a more sophisticated state management system
  return Buffer.from(state).toString('base64');
}

/**
 * Parse and validate an OAuth state parameter
 * @param state - The state parameter from the OAuth callback
 * @returns The user ID if valid, null otherwise
 */
export function parseOAuthState(state: string): string | null {
  try {
    const decoded = Buffer.from(state, 'base64').toString();
    const parts = decoded.split(':');
    
    if (parts.length !== 3) {
      return null;
    }
    
    const [userId, timestamp, random] = parts;
    const stateTime = parseInt(timestamp, 10);
    const currentTime = Date.now();
    
    // State should be valid for 10 minutes
    if (currentTime - stateTime > 10 * 60 * 1000) {
      return null;
    }
    
    return userId;
  } catch (error) {
    return null;
  }
} 