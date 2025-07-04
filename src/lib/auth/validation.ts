import { ValidationError } from './types';
import { validateBitcoinPublicKey } from './signature';

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export function validateHexString(value: string, name: string): void {
  if (!value || typeof value !== 'string') {
    throw new ValidationError(`${name} must be a non-empty string`);
  }
  
  if (!/^[0-9a-fA-F]+$/.test(value)) {
    throw new ValidationError(`${name} must be a valid hex string`);
  }
}

export function validatePublicKey(pubKey: string): void {
  if (!pubKey || typeof pubKey !== 'string') {
    throw new ValidationError('Public key must be a non-empty string');
  }
  
  // Use Bitcoin-specific validation for better security
  if (!validateBitcoinPublicKey(pubKey)) {
    throw new ValidationError('Public key must be a valid Bitcoin public key');
  }
}

export function validateChallenge(challenge: string): void {
  validateHexString(challenge, 'Challenge');
  
  if (challenge.length !== 64) {
    throw new ValidationError('Challenge must be exactly 64 characters (32 bytes)');
  }
}

export function validateSignature(signature: string): void {
  validateHexString(signature, 'Signature');
  
  // Bitcoin compact signatures are 65 bytes (130 hex characters)
  if (signature.length !== 130) {
    throw new ValidationError('Signature must be exactly 130 characters (65 bytes) for Bitcoin compact signature');
  }
} 