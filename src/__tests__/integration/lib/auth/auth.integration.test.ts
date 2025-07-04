import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { 
  generateAuthChallenge, 
  verifyAuthChallenge, 
  getOrCreateUser, 
  checkAuthStatus,
  cleanupExpiredChallenges
} from '@/lib/auth'
import { PrismaClient } from '@/generated/prisma'

// Testnet keypair generated for integration tests
const pubKey1 = '032f648c133686cdb2e2862da8cb0518c92f701c500ceded92267d539a1828244b'

// Valid test data matching setup-test-db.js
const pubKey2 = '02be0f7b80cfd2b3d89012c19e286437d90c192bd26e814fd5c90d6090c0a9bff2'
const challenge1 = 'b7ee6b7d497cb21df2101e1a3f3b85322ab8c4d5a496b05de9dcb50995f04ae1'
const challenge2 = '344308201b1c8a7af19f36bcddcb011921b8d6c7ec189b0427823a0872aef535'
const validSignature = '1f368eeeec0640708f4a2c37fd403b98e52321c99cdc886a8d487651620250ba3311115d6dea5ebee090403a2721addbc2c4a523e9e351d8f076466f15ae80ede8'

describe('Auth Module Integration Tests', () => {
  let prisma: PrismaClient

  beforeAll(async () => {
    // Wait for global prisma to be available
    await new Promise(resolve => setTimeout(resolve, 100))
    prisma = global.prisma
    
    if (!prisma) {
      throw new Error('Prisma client not available')
    }

    // Debug: Print database URL and check seeded data
    console.log('🧪 Test - Database URL:', process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5433/hive_test')
    
    const userCount = await prisma.user.count()
    const challengeCount = await prisma.authChallenge.count()
    console.log('🧪 Test - Seeded users count:', userCount)
    console.log('🧪 Test - Seeded challenges count:', challengeCount)
  })

  beforeEach(async () => {
    // Ensure prisma is available
    if (!global.prisma) {
      throw new Error('Prisma client not available')
    }
    prisma = global.prisma
    // Only delete non-seeded data
    await prisma.authChallenge.deleteMany({
      where: {
        challenge: {
          notIn: [challenge1, challenge2]
        }
      }
    })
    await prisma.user.deleteMany({
      where: {
        ownerPubKey: {
          notIn: [pubKey1, pubKey2]
        }
      }
    })
  })

  describe('Complete Authentication Flow', () => {
    it('should verify signature with bitcoinjs-message correctly', async () => {
      // First, create a challenge for pubKey1
      const challenge = await generateAuthChallenge()
      console.log('🧪 Generated challenge:', challenge.challenge)
      
      // Test with invalid signature (should fail)
      const invalidSignature = '1f' + '0'.repeat(128) // Placeholder signature
      
      const invalidResult = await verifyAuthChallenge(
        challenge.challenge,
        pubKey1,
        invalidSignature
      )
      expect(invalidResult).toBe(false)
      
      // Test with valid signature (should pass)
      const validResult = await verifyAuthChallenge(
        challenge.challenge,
        pubKey1,
        validSignature
      )
      expect(validResult).toBe(true)
    })

    it('should create and verify user with valid signature', async () => {
      // Generate a new challenge
      const challenge = await generateAuthChallenge()
      
      // Verify the challenge with valid signature
      const isValid = await verifyAuthChallenge(
        challenge.challenge,
        pubKey1,
        validSignature
      )
      expect(isValid).toBe(true)
      
      // Get or create user
      const user = await getOrCreateUser(pubKey1, 'test-user')
      expect(user.ownerPubKey).toBe(pubKey1)
      expect(user.ownerAlias).toBe('test-user')
    })

    it('should check auth status with valid challenge', async () => {
      // First create a verified challenge
      const challenge = await generateAuthChallenge()
      await verifyAuthChallenge(challenge.challenge, pubKey1, validSignature)
      
      // Check auth status
      const authStatus = await checkAuthStatus(challenge.challenge)
      expect(authStatus).toBeDefined()
      expect(authStatus).not.toBeNull()
      if (authStatus) {
        expect(authStatus.pubkey).toBe(pubKey1)
        expect(authStatus.jwt).toBeDefined()
      }
    })
  })

  describe('Challenge Management', () => {
    it('should generate unique challenges', async () => {
      const challenge1 = await generateAuthChallenge()
      const challenge2 = await generateAuthChallenge()
      
      expect(challenge1.challenge).not.toBe(challenge2.challenge)
      expect(challenge1.ts).not.toBe(challenge2.ts)
    })

    it('should reject expired challenges', async () => {
      // Create an expired challenge manually
      const expiredChallenge = await prisma.authChallenge.create({
        data: {
          challenge: 'expired-challenge',
          expiresAt: new Date(Date.now() - 1000), // 1 second ago
        },
      })

      const result = await verifyAuthChallenge(
        expiredChallenge.challenge,
        pubKey1,
        validSignature
      )
      expect(result).toBe(false)
    })
  })

  describe('User Management', () => {
    it('should create new user if not exists', async () => {
      const newPubKey = '02' + 'a'.repeat(64) // Valid pubkey format
      const user = await getOrCreateUser(newPubKey, 'new-user')
      
      expect(user.ownerPubKey).toBe(newPubKey)
      expect(user.ownerAlias).toBe('new-user')
      
      // Verify user was created in database
      const dbUser = await prisma.user.findUnique({
        where: { ownerPubKey: newPubKey }
      })
      expect(dbUser).toBeDefined()
      expect(dbUser?.ownerAlias).toBe('new-user')
    })

    it('should return existing user if exists', async () => {
      // Create user first
      const user1 = await getOrCreateUser(pubKey1, 'first-alias')
      expect(user1.ownerAlias).toBe('first-alias')
      
      // Get same user with different alias
      const user2 = await getOrCreateUser(pubKey1, 'second-alias')
      expect(user2.ownerPubKey).toBe(pubKey1)
      expect(user2.ownerAlias).toBe('second-alias') // Should update alias
    })
  })

  describe('Cleanup Operations', () => {
    it('should cleanup expired challenges', async () => {
      // Create some expired challenges
      await prisma.authChallenge.createMany({
        data: [
          {
            challenge: 'expired-1',
            expiresAt: new Date(Date.now() - 1000),
          },
          {
            challenge: 'expired-2',
            expiresAt: new Date(Date.now() - 2000),
          },
          {
            challenge: 'valid-1',
            expiresAt: new Date(Date.now() + 60000), // 1 minute from now
          },
        ],
      })

      const initialChallenges = await prisma.authChallenge.findMany()
      expect(initialChallenges.length).toBeGreaterThan(2)

      // Run cleanup
      await cleanupExpiredChallenges()

      const remainingChallenges = await prisma.authChallenge.findMany()
      const validChallenges = remainingChallenges.filter(c => 
        c.challenge === 'valid-1' || c.challenge === challenge1 || c.challenge === challenge2
      )
      
      expect(validChallenges.length).toBeGreaterThan(0)
      expect(remainingChallenges.length).toBeLessThan(initialChallenges.length)
    })
  })

  describe('Database Operations', () => {
    it('should handle multiple users correctly', async () => {
      // Create multiple users
      const users = await prisma.user.findMany({
        where: {
          ownerPubKey: {
            in: [pubKey1, pubKey2]
          }
        }
      })
      
      expect(users.length).toBeGreaterThan(0)
      
      // Create additional users
      await prisma.user.createMany({
        data: [
          {
            ownerPubKey: '03' + 'b'.repeat(64),
            ownerAlias: 'user-3',
          },
          {
            ownerPubKey: '03' + 'c'.repeat(64),
            ownerAlias: 'user-4',
          },
        ],
      })

      const updatedUsers = await prisma.user.findMany({
        where: {
          ownerPubKey: {
            in: [pubKey1, pubKey2, '03' + 'b'.repeat(64), '03' + 'c'.repeat(64)]
          }
        }
      })
      
      expect(updatedUsers.length).toBeGreaterThan(users.length)
    })

    it('should handle multiple challenges correctly', async () => {
      // Create multiple challenges
      const challenges = await prisma.authChallenge.findMany({
        where: {
          challenge: {
            in: [challenge1, challenge2]
          }
        }
      })
      
      expect(challenges.length).toBeGreaterThan(0)
      
      // Create additional challenges
      await prisma.authChallenge.createMany({
        data: [
          {
            challenge: 'challenge-3',
            expiresAt: new Date(Date.now() + 300000),
          },
          {
            challenge: 'challenge-4',
            expiresAt: new Date(Date.now() + 400000),
          },
        ],
      })

      const updatedChallenges = await prisma.authChallenge.findMany({
        where: {
          challenge: {
            in: [challenge1, challenge2, 'challenge-3', 'challenge-4']
          }
        }
      })
      
      expect(updatedChallenges.length).toBeGreaterThan(challenges.length)
    })
  })
}) 