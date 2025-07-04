// ============================================================================
// AUTH MODULE TYPES & INTERFACES
// ============================================================================

export interface AuthUser {
  id: string;
  ownerPubKey: string;
  ownerAlias?: string;
  role: string;
  name?: string;
  avatar?: string;
}

export interface AuthChallenge {
  challenge: string;
  ts: number;
}

export interface AuthResponse {
  pubkey: string;
  owner_alias?: string;
  img?: string;
  jwt: string;
}

export interface JWTPayload {
  id: string;
  pubKey: string;
  role: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
} 