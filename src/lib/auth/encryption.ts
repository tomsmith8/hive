import crypto from 'crypto';

// ============================================================================
// TOKEN ENCRYPTION UTILITIES
// ============================================================================

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES block size

if (!ENCRYPTION_KEY) {
  throw new Error('TOKEN_ENCRYPTION_KEY environment variable is required for token encryption');
}

// Ensure the key is 32 bytes
const KEY = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0')).subarray(0, 32);

/**
 * Encrypt a token for secure storage
 * @param token - The token to encrypt
 * @returns The encrypted token as a base64 string
 */
export function encryptToken(token: string): string {
  if (!token) {
    throw new Error('Token cannot be empty');
  }

  // Generate a random IV
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Create cipher using AES-256-CBC
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  // Encrypt the token
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Combine IV and encrypted data
  const combined = Buffer.concat([iv, Buffer.from(encrypted, 'hex')]);
  
  return combined.toString('base64');
}

/**
 * Decrypt a token from secure storage
 * @param encryptedToken - The encrypted token as a base64 string
 * @returns The decrypted token
 */
export function decryptToken(encryptedToken: string): string {
  if (!encryptedToken) {
    throw new Error('Encrypted token cannot be empty');
  }

  try {
    // Convert from base64
    const combined = Buffer.from(encryptedToken, 'base64');
    
    // Extract IV (first 16 bytes)
    const iv = combined.subarray(0, IV_LENGTH);
    
    // Extract encrypted data (remaining bytes)
    const encrypted = combined.subarray(IV_LENGTH);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    
    // Decrypt the token
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Failed to decrypt token: ' + errorMessage);
  }
}

/**
 * Check if a token is encrypted (basic heuristic)
 * @param token - The token to check
 * @returns True if the token appears to be encrypted
 */
export function isEncryptedToken(token: string): boolean {
  try {
    // Try to decode as base64 and check if it has the expected structure
    const combined = Buffer.from(token, 'base64');
    return combined.length >= IV_LENGTH; // IV (16) + minimum encrypted data
  } catch {
    return false;
  }
} 