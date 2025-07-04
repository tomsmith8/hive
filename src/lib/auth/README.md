# Auth Module - Production Ready

This directory contains the production-ready authentication system, split into focused, single-responsibility modules with proper Bitcoin signature verification.

## 📁 Module Structure

### Core Modules
- **`types.ts`** - TypeScript interfaces and error classes
- **`config.ts`** - Configuration constants and environment variables
- **`validation.ts`** - Input validation utilities with Bitcoin-specific validation
- **`database.ts`** - Database operations (Prisma interactions)
- **`jwt.ts`** - JWT token generation and verification
- **`signature.ts`** - Production-ready Bitcoin signature verification using bitcoinjs-lib
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
import { verifyBitcoinSignature, validateBitcoinPublicKey } from '@/lib/auth/signature';

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
- `validatePublicKey()` - Bitcoin public key validation using bitcoinjs-lib
- `validateChallenge()` - Challenge validation (64 hex chars)
- `validateSignature()` - Bitcoin signature validation (130 hex chars for compact signatures)

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

### `signature.ts` - **PRODUCTION READY**
- `verifyBitcoinSignature()` - Production-ready Bitcoin ECDSA signature verification using bitcoinjs-lib
- `verifyBitcoinSignatureDER()` - Alternative DER signature verification
- `validateBitcoinAddress()` - Bitcoin address validation
- `validateBitcoinPublicKey()` - Bitcoin public key format validation
- Uses proper ECDSA recovery with secp256k1 curve
- Implements Bitcoin message signing standard with double SHA256

### `challenges.ts`
- `generateAuthChallenge()` - Generate new authentication challenge
- `verifyAuthChallenge()` - Verify signed challenge using production-ready signature verification

### `users.ts`
- `getOrCreateUser()` - Get existing user or create new one

### `flow.ts`
- `checkAuthStatus()` - Main authentication flow

### `maintenance.ts`
- `cleanupExpiredChallenges()` - Clean up expired challenges

## 🔒 Security Features

### Bitcoin Signature Verification
- **Production-ready**: Uses bitcoinjs-lib and tiny-secp256k1 for proper ECDSA operations
- **Bitcoin Standard**: Implements Bitcoin message signing with proper prefix and double SHA256
- **Signature Recovery**: Properly recovers public keys from signatures for verification
- **Multiple Formats**: Supports both compact and DER signature formats
- **Validation**: Comprehensive validation of public keys and signatures

### Input Validation
- **Hex Validation**: Strict hex string validation for all cryptographic inputs
- **Length Validation**: Proper length validation for Bitcoin-specific formats
- **Format Validation**: Bitcoin address and public key format validation

### JWT Security
- **Environment Variables**: JWT secret must be set via environment variable
- **Expiration**: Configurable token expiration (default: 7 days)
- **Payload Validation**: Strict validation of JWT payload structure

## 🧪 Testing

The modular structure makes testing easier:
- Each module can be tested independently
- Mocking is more focused and specific
- Test files can import only what they need
- Comprehensive test coverage for all authentication flows

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

1. **Production Security** - Proper Bitcoin signature verification using industry-standard libraries
2. **Separation of Concerns** - Each module has a single responsibility
3. **Better Testability** - Modules can be tested in isolation
4. **Improved Maintainability** - Changes are localized to specific modules
5. **Enhanced Readability** - Code is organized by functionality
6. **Better Tree Shaking** - Unused modules can be excluded from bundles
7. **Easier Debugging** - Issues can be traced to specific modules
8. **Team Collaboration** - Different team members can work on different modules

## 🔧 Dependencies

### Required Dependencies
- `bitcoinjs-lib` - Bitcoin protocol implementation
- `ecpair` - ECDSA key pair management
- `tiny-secp256k1` - secp256k1 curve operations
- `jsonwebtoken` - JWT operations
- `crypto` - Node.js crypto module for hashing

### Security Notes
- All cryptographic operations use industry-standard libraries
- Bitcoin signature verification follows Bitcoin Core standards
- JWT operations use secure defaults and proper validation
- Input validation prevents common attack vectors 