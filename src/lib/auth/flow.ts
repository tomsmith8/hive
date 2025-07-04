import { AuthResponse, ValidationError } from './types';
import { validateChallenge } from './validation';
import { findAuthChallenge, updateUserJWT } from './database';
import { generateJWT } from './jwt';
import { getOrCreateUser } from './users';

// ============================================================================
// AUTHENTICATION FLOW
// ============================================================================

export async function checkAuthStatus(challenge: string): Promise<AuthResponse | null> {
  try {
    validateChallenge(challenge);

    const authChallenge = await findAuthChallenge(challenge);

    if (!authChallenge || !authChallenge.status || !authChallenge.pubKey) {
      return null;
    }

    // Check if challenge has expired
    if (new Date() > authChallenge.expiresAt) {
      return null;
    }

    const user = await getOrCreateUser(authChallenge.pubKey);
    const jwtToken = generateJWT(user);

    await updateUserJWT(user.id, jwtToken);

    return {
      pubkey: user.ownerPubKey,
      owner_alias: user.ownerAlias,
      img: user.avatar,
      jwt: jwtToken,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Validation error in checkAuthStatus:', error.message);
      return null;
    }
    
    console.error('Error checking auth status:', error);
    return null;
  }
} 