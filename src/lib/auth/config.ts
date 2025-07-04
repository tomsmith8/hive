// ============================================================================
// AUTH MODULE CONFIGURATION
// ============================================================================

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required. Please set it in your .env file.');
}

export const JWT_SECRET_ASSERTED = JWT_SECRET as string;
export const JWT_EXPIRES_IN = '7d';
export const CHALLENGE_EXPIRY_MINUTES = 5;
export const JWT_EXPIRY_DAYS = 7; 