# Auth Module - Modular Structure

This directory contains the modularized authentication system, split into focused, single-responsibility modules.

## 📁 Module Structure

### Core Modules
- **`types.ts`** - TypeScript interfaces and error classes
- **`config.ts`** - Configuration constants and environment variables
- **`validation.ts`** - Input validation utilities
- **`database.ts`** - Database operations (Prisma interactions)
- **`jwt.ts`** - JWT token generation and verification
- **`signature.ts`** - Bitcoin signature verification
- **`challenges.ts`** - Authentication challenge management
- **`users.ts`** - User management operations
- **`flow.ts`** - Main authentication flow logic
- **`maintenance.ts`** - Cleanup and maintenance operations
- **`index.ts`** - Main exports for the module

## 🚀 Usage

### Backward Compatibility
All existing imports continue to work:
```typescript
import { generateAuthChallenge, verifyAuthChallenge, getOrCreateUser } from '@/lib/auth';
```

### Direct Module Imports (Recommended)
For new code, import directly from specific modules:
```typescript
// Import specific functionality
import { generateAuthChallenge } from '@/lib/auth/challenges';
import { getOrCreateUser } from '@/lib/auth/users';
import { generateJWT } from '@/lib/auth/jwt';
import { validatePublicKey } from '@/lib/auth/validation';

// Import types
import { AuthUser, AuthError } from '@/lib/auth/types';
```

## 🔧 Module Responsibilities

### `types.ts`
- `AuthUser` interface
- `AuthChallenge` interface  
- `AuthResponse` interface
- `JWTPayload` interface
- `AuthError` and `ValidationError` classes

### `config.ts`
- JWT secret configuration
- Expiry time constants
- Environment variable validation

### `validation.ts`
- `validateHexString()` - Hex string validation
- `validatePublicKey()` - Public key validation
- `validateChallenge()` - Challenge validation
- `validateSignature()` - Signature validation

### `database.ts`
- `createAuthChallenge()` - Create new auth challenge
- `findAuthChallenge()` - Find challenge by ID
- `updateAuthChallengeStatus()` - Update challenge status
- `findUserByPubKey()` - Find user by public key
- `createUser()` - Create new user
- `updateUserLogin()` - Update user login time
- `updateUserJWT()` - Update user JWT token
- `deleteExpiredChallenges()` - Clean up expired challenges

### `jwt.ts`
- `generateJWT()` - Generate JWT token from user data
- `verifyJWT()` - Verify and decode JWT token

### `signature.ts`
- `verifyBitcoinSignature()` - Verify Bitcoin ECDSA signatures

### `challenges.ts`
- `generateAuthChallenge()` - Generate new authentication challenge
- `verifyAuthChallenge()` - Verify signed challenge

### `users.ts`
- `getOrCreateUser()` - Get existing user or create new one

### `flow.ts`
- `checkAuthStatus()` - Main authentication flow

### `maintenance.ts`
- `cleanupExpiredChallenges()` - Clean up expired challenges

## 🧪 Testing

The modular structure makes testing easier:
- Each module can be tested independently
- Mocking is more focused and specific
- Test files can import only what they need

## 🔄 Migration Guide

### Existing Code
No changes needed - all imports from `@/lib/auth` continue to work.

### New Code
Consider importing directly from specific modules for better tree-shaking and clarity:

```typescript
// Instead of:
import { generateAuthChallenge, verifyAuthChallenge } from '@/lib/auth';

// Consider:
import { generateAuthChallenge } from '@/lib/auth/challenges';
import { verifyAuthChallenge } from '@/lib/auth/challenges';
```

## 📊 Benefits

1. **Separation of Concerns** - Each module has a single responsibility
2. **Better Testability** - Modules can be tested in isolation
3. **Improved Maintainability** - Changes are localized to specific modules
4. **Enhanced Readability** - Code is organized by functionality
5. **Better Tree Shaking** - Unused modules can be excluded from bundles
6. **Easier Debugging** - Issues can be traced to specific modules
7. **Team Collaboration** - Different team members can work on different modules 