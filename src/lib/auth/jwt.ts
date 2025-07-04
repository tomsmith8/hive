import jwt from 'jsonwebtoken';
import { AuthUser, JWTPayload, ValidationError } from './types';
import { JWT_SECRET_ASSERTED, JWT_EXPIRES_IN } from './config';

// ============================================================================
// JWT OPERATIONS
// ============================================================================

export function generateJWT(user: AuthUser): string {
  if (!user || !user.id || !user.ownerPubKey || !user.role) {
    throw new ValidationError('Invalid user data for JWT generation');
  }

  const payload: JWTPayload = {
    id: user.id,
    pubKey: user.ownerPubKey,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET_ASSERTED, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJWT(token: string): AuthUser | null {
  if (!token || typeof token !== 'string') {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET_ASSERTED) as JWTPayload;
    
    return {
      id: decoded.id,
      ownerPubKey: decoded.pubKey,
      role: decoded.role,
    };
  } catch {
    return null;
  }
} 