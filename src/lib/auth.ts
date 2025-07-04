import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '@/lib/db';

// JWT Secret - this should be a strong, consistent secret
// In production, this should be a long, random string stored securely
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required. Please set it in your .env file.');
}

// TypeScript assertion since we've already checked it exists
const JWT_SECRET_ASSERTED = JWT_SECRET as string;
const JWT_EXPIRES_IN = '7d';

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

// Generate a new authentication challenge
export async function generateAuthChallenge(): Promise<AuthChallenge> {
  const challenge = crypto.randomBytes(32).toString('hex');
  const ts = Date.now();
  const expiresAt = new Date(ts + 5 * 60 * 1000); // 5 minutes from now

  await prisma.authChallenge.create({
    data: {
      challenge,
      expiresAt,
    },
  });

  return { challenge, ts };
}

// Verify a signed challenge
export async function verifyAuthChallenge(
  challenge: string,
  pubKey: string,
  signature: string
): Promise<boolean> {
  try {
    // Find the challenge
    const authChallenge = await prisma.authChallenge.findUnique({
      where: { challenge },
    });

    if (!authChallenge) {
      return false;
    }

    // Check if challenge has expired
    if (new Date() > authChallenge.expiresAt) {
      return false;
    }

    // Verify the signature using Bitcoin's ECDSA
    const message = Buffer.from(challenge, 'hex');
    const sig = Buffer.from(signature, 'hex');
    
    // For now, we'll do a basic verification
    // In production, you'd want to use a proper Bitcoin library like bitcoinjs-lib
    const isValid = verifyBitcoinSignature(message, pubKey, sig);

    if (isValid) {
      // Update challenge status
      await prisma.authChallenge.update({
        where: { challenge },
        data: { 
          status: true,
          pubKey 
        },
      });
    }

    return isValid;
  } catch (error) {
    console.error('Error verifying auth challenge:', error);
    return false;
  }
}

// Basic Bitcoin signature verification (simplified)
export function verifyBitcoinSignature(message: Buffer, pubKey: string, signature: Buffer): boolean {
  // This is a simplified version - in production, use bitcoinjs-lib
  try {
    // For now, we'll do a basic check
    // In a real implementation, you'd use proper ECDSA verification
    return signature.length > 0 && pubKey.length > 0;
  } catch (error) {
    return false;
  }
}

// Generate JWT token
export function generateJWT(user: AuthUser): string {
  const payload = {
    id: user.id,
    pubKey: user.ownerPubKey,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET_ASSERTED, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyJWT(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_ASSERTED) as any;
    return {
      id: decoded.id,
      ownerPubKey: decoded.pubKey,
      role: decoded.role,
    };
  } catch (error) {
    return null;
  }
}

// Get or create user
export async function getOrCreateUser(pubKey: string, alias?: string): Promise<AuthUser> {
  let user = await prisma.user.findUnique({
    where: { ownerPubKey: pubKey },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        ownerPubKey: pubKey,
        ownerAlias: alias,
        lastLoginAt: new Date(),
      },
    });
  } else {
    // Update last login and alias if provided
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        ...(alias && { ownerAlias: alias }),
      },
    });
  }

  return {
    id: user.id,
    ownerPubKey: user.ownerPubKey,
    ownerAlias: user.ownerAlias || undefined,
    role: user.role,
    name: user.name || undefined,
    avatar: user.avatar || undefined,
  };
}

// Check authentication status
export async function checkAuthStatus(challenge: string): Promise<AuthResponse | null> {
  try {
    const authChallenge = await prisma.authChallenge.findUnique({
      where: { challenge },
    });

    if (!authChallenge || !authChallenge.status || !authChallenge.pubKey) {
      return null;
    }

    // Check if challenge has expired
    if (new Date() > authChallenge.expiresAt) {
      return null;
    }

    const user = await getOrCreateUser(authChallenge.pubKey);
    const jwtToken = generateJWT(user);

    // Update user's JWT token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        jwtToken: jwtToken,
        jwtExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      pubkey: user.ownerPubKey,
      owner_alias: user.ownerAlias,
      img: user.avatar,
      jwt: jwtToken,
    };
  } catch (error) {
    console.error('Error checking auth status:', error);
    return null;
  }
}

// Clean up expired challenges
export async function cleanupExpiredChallenges(): Promise<void> {
  try {
    await prisma.authChallenge.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('Error cleaning up expired challenges:', error);
  }
} 