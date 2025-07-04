import { prisma } from '@/lib/db';
import { JWT_EXPIRY_DAYS } from './config';

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

export async function createAuthChallenge(challenge: string, expiresAt: Date): Promise<void> {
  await prisma.authChallenge.create({
    data: {
      challenge,
      expiresAt,
    },
  });
}

export async function findAuthChallenge(challenge: string) {
  return await prisma.authChallenge.findUnique({
    where: { challenge },
  });
}

export async function updateAuthChallengeStatus(challenge: string, pubKey: string): Promise<void> {
  await prisma.authChallenge.update({
    where: { challenge },
    data: { 
      status: true,
      pubKey 
    },
  });
}

export async function findUserByPubKey(pubKey: string) {
  return await prisma.user.findUnique({
    where: { ownerPubKey: pubKey },
  });
}

export async function createUser(pubKey: string, alias?: string) {
  return await prisma.user.create({
    data: {
      ownerPubKey: pubKey,
      ownerAlias: alias,
      lastLoginAt: new Date(),
    },
  });
}

export async function updateUserLogin(userId: string, alias?: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      lastLoginAt: new Date(),
      ...(alias && { ownerAlias: alias }),
    },
  });
}

export async function updateUserJWT(userId: string, jwtToken: string): Promise<void> {
  const jwtExpiresAt = new Date(Date.now() + JWT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      jwtToken,
      jwtExpiresAt,
    },
  });
}

export async function deleteExpiredChallenges(): Promise<void> {
  await prisma.authChallenge.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
} 