import crypto from 'crypto';

// ============================================================================
// TOKEN ENCRYPTION UTILITIES
// ============================================================================

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error('TOKEN_ENCRYPTION_KEY environment variable is required for token encryption');
}

if (ENCRYPTION_KEY.length < 32) {
  throw new Error('TOKEN_ENCRYPTION_KEY must be at least 32 characters long');
}

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
  const iv = crypto.randomBytes(16);
  
  // Create cipher using AES-256-CBC
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  
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
    const iv = combined.subarray(0, 16);
    
    // Extract encrypted data (remaining bytes)
    const encrypted = combined.subarray(16).toString('hex');
    
    // Create decipher
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    
    // Decrypt the token
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
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
    return combined.length >= 16; // IV (16) + minimum encrypted data
  } catch {
    return false;
  }
} 