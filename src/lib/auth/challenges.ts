import crypto from 'crypto';
import { AuthChallenge, AuthError, ValidationError } from './types';
import { CHALLENGE_EXPIRY_MINUTES } from './config';
import { validateChallenge, validatePublicKey, validateSignature } from './validation';
import { createAuthChallenge, findAuthChallenge, updateAuthChallengeStatus } from './database';
import { verifyBitcoinSignature } from './signature';

// ============================================================================
// CHALLENGE MANAGEMENT
// ============================================================================

export async function generateAuthChallenge(): Promise<AuthChallenge> {
  try {
    const challenge = crypto.randomBytes(32).toString('hex');
    const ts = Date.now();
    const expiresAt = new Date(ts + CHALLENGE_EXPIRY_MINUTES * 60 * 1000);

    await createAuthChallenge(challenge, expiresAt);

    return { challenge, ts };
  } catch (error) {
    console.error('Error generating auth challenge:', error);
    throw new AuthError('Failed to generate authentication challenge', 'CHALLENGE_GENERATION_FAILED');
  }
}

export async function verifyAuthChallenge(
  challenge: string,
  pubKey: string,
  signature: string
): Promise<boolean> {
  try {
    // Input validation
    validateChallenge(challenge);
    validatePublicKey(pubKey);
    validateSignature(signature);

    // Find the challenge
    const authChallenge = await findAuthChallenge(challenge);
    if (!authChallenge) {
      return false;
    }

    // Check if challenge has expired
    if (new Date() > authChallenge.expiresAt) {
      return false;
    }

    // Verify the signature using Bitcoin's ECDSA
    const message = Buffer.from(challenge, 'hex');
    const sig = Buffer.from(signature, 'hex');
    
    const isValid = verifyBitcoinSignature(message, pubKey, sig);

    if (isValid) {
      await updateAuthChallengeStatus(challenge, pubKey);
    }

    return isValid;
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Validation error in verifyAuthChallenge:', error.message);
      return false;
    }
    
    console.error('Error verifying auth challenge:', error);
    return false;
  }
} 