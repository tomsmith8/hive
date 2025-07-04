import { ValidationError } from './types';

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
  
  if (pubKey.length < 10) {
    throw new ValidationError('Public key must be at least 10 characters long');
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
  
  if (signature.length < 10) {
    throw new ValidationError('Signature must be at least 10 characters long');
  }
} 