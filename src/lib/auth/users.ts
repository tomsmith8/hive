import { AuthUser, AuthError, ValidationError } from './types';
import { validatePublicKey } from './validation';
import { findUserByPubKey, createUser, updateUserLogin } from './database';

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function getOrCreateUser(pubKey: string, alias?: string): Promise<AuthUser> {
  try {
    validatePublicKey(pubKey);
    
    if (alias && typeof alias !== 'string') {
      throw new ValidationError('Alias must be a string');
    }

    let user = await findUserByPubKey(pubKey);

    if (!user) {
      user = await createUser(pubKey, alias);
    } else {
      user = await updateUserLogin(user.id, alias);
    }

    return {
      id: user.id,
      ownerPubKey: user.ownerPubKey,
      ownerAlias: user.ownerAlias || undefined,
      role: user.role,
      name: user.name || undefined,
      avatar: user.avatar || undefined,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    
    console.error('Error in getOrCreateUser:', error);
    throw new AuthError('Failed to get or create user', 'USER_OPERATION_FAILED');
  }
} 