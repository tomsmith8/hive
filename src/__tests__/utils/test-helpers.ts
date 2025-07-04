import { AuthUser } from '@/lib/auth'
import { UserRole } from '@/generated/prisma'

export interface TestUser {
  id: string
  ownerPubKey: string
  ownerAlias?: string
  role: UserRole
  name?: string
  avatar?: string
}

export interface TestChallenge {
  id: string
  challenge: string
  pubKey?: string
  status: boolean
  expiresAt: Date
}

export class TestHelper {
  static async createTestUser(data: Partial<TestUser> = {}): Promise<TestUser> {
    const defaultUser = {
      ownerPubKey: `test-pubkey-${Date.now()}`,
      ownerAlias: `test-alias-${Date.now()}`,
      role: UserRole.USER,
      name: 'Test User',
      avatar: 'test-avatar'
    }

    const userData = { ...defaultUser, ...data }
    
    const user = await prisma.user.create({
      data: userData
    })

    return {
      id: user.id,
      ownerPubKey: user.ownerPubKey,
      ownerAlias: user.ownerAlias || undefined,
      role: user.role,
      name: user.name || undefined,
      avatar: user.avatar || undefined
    }
  }

  static async createTestChallenge(data: Partial<TestChallenge> = {}): Promise<TestChallenge> {
    const defaultChallenge = {
      challenge: `test-challenge-${Date.now()}`,
      status: false,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
    }

    const challengeData = { ...defaultChallenge, ...data }
    
    const challenge = await prisma.authChallenge.create({
      data: challengeData
    })

    return {
      id: challenge.id,
      challenge: challenge.challenge,
      pubKey: challenge.pubKey || undefined,
      status: challenge.status,
      expiresAt: challenge.expiresAt
    }
  }

  static async createExpiredChallenge(data: Partial<TestChallenge> = {}): Promise<TestChallenge> {
    const defaultChallenge = {
      challenge: `expired-challenge-${Date.now()}`,
      status: false,
      expiresAt: new Date(Date.now() - 6 * 60 * 1000) // 6 minutes ago
    }

    const challengeData = { ...defaultChallenge, ...data }
    
    const challenge = await prisma.authChallenge.create({
      data: challengeData
    })

    return {
      id: challenge.id,
      challenge: challenge.challenge,
      pubKey: challenge.pubKey || undefined,
      status: challenge.status,
      expiresAt: challenge.expiresAt
    }
  }

  static async createVerifiedChallenge(
    pubKey: string, 
    data: Partial<TestChallenge> = {}
  ): Promise<TestChallenge> {
    const defaultChallenge = {
      challenge: `verified-challenge-${Date.now()}`,
      pubKey,
      status: true,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    }

    const challengeData = { ...defaultChallenge, ...data }
    
    const challenge = await prisma.authChallenge.create({
      data: challengeData
    })

    return {
      id: challenge.id,
      challenge: challenge.challenge,
      pubKey: challenge.pubKey || undefined,
      status: challenge.status,
      expiresAt: challenge.expiresAt
    }
  }

  static async cleanupDatabase(): Promise<void> {
    await prisma.authChallenge.deleteMany()
    await prisma.user.deleteMany()
  }

  static generateRandomPubKey(): string {
    return `pubkey-${Math.random().toString(36).substring(2, 15)}`
  }

  static generateRandomSignature(): string {
    return `signature-${Math.random().toString(36).substring(2, 15)}`
  }

  static generateRandomChallenge(): string {
    return `challenge-${Math.random().toString(36).substring(2, 15)}`
  }

  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  static createAuthUserFromTestUser(testUser: TestUser): AuthUser {
    return {
      id: testUser.id,
      ownerPubKey: testUser.ownerPubKey,
      ownerAlias: testUser.ownerAlias,
      role: testUser.role,
      name: testUser.name,
      avatar: testUser.avatar
    }
  }
}

// Test helper utilities
export function createMockUser(overrides = {}) {
  return {
    id: 'test-user-id',
    ownerPubKey: '02be0f7b80cfd2b3d89012c19e286437d90c192bd26e814fd5c90d6090c0a9bff2',
    ownerAlias: 'test-user',
    role: 'USER',
    name: 'Test User',
    description: 'Test user for unit tests',
    avatar: 'https://example.com/avatar.jpg',
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function createMockAuthChallenge(overrides = {}) {
  return {
    id: 'test-challenge-id',
    challenge: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    pubKey: '02be0f7b80cfd2b3d89012c19e286437d90c192bd26e814fd5c90d6090c0a9bff2',
    status: false,
    expiresAt: new Date(Date.now() + 300000), // 5 minutes from now
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
} 