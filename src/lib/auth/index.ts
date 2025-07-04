// ============================================================================
// AUTH MODULE MAIN EXPORTS
// ============================================================================

// Re-export all types
export * from './types';

// Re-export all functions
export { generateAuthChallenge, verifyAuthChallenge } from './challenges';
export { getOrCreateUser } from './users';
export { checkAuthStatus } from './flow';
export { generateJWT, verifyJWT } from './jwt';
export { verifyBitcoinSignature } from './signature';
export { cleanupExpiredChallenges } from './maintenance';

// Re-export validation functions for external use
export { 
  validateHexString, 
  validatePublicKey, 
  validateChallenge, 
  validateSignature 
} from './validation'; 