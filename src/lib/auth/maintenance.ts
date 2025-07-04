import { AuthError } from './types';
import { deleteExpiredChallenges } from './database';

// ============================================================================
// MAINTENANCE OPERATIONS
// ============================================================================

export async function cleanupExpiredChallenges(): Promise<void> {
  try {
    await deleteExpiredChallenges();
  } catch (error) {
    console.error('Error cleaning up expired challenges:', error);
    throw new AuthError('Failed to cleanup expired challenges', 'CLEANUP_FAILED');
  }
} 