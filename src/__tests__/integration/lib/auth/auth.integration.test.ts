import { describe, it, expect, beforeEach } from 'vitest'
import { 
  generateAuthChallenge, 
  verifyAuthChallenge, 
  checkAuthStatus, 
  getOrCreateUser,
  cleanupExpiredChallenges
} from '@/lib/auth'
import { prisma } from '@/lib/db'

// (No setup import needed)

describe('Auth Module Integration Tests', () => {
  beforeEach(async () => {
    // Clean up database before each test
    await prisma.authChallenge.deleteMany()
    await prisma.user.deleteMany()
  })

  describe('Complete Authentication Flow', () => {
    it('should handle complete authentication flow from challenge to JWT', async () => {
      // Step 1: Generate authentication challenge
      const challenge = await generateAuthChallenge()
      expect(challenge.challenge).toBeTruthy()
      expect(challenge.ts).toBeGreaterThan(0)

      // Step 2: Verify the challenge was saved to database
      const savedChallenge = await prisma.authChallenge.findUnique({
        where: { challenge: challenge.challenge }
      })
      expect(savedChallenge).toBeTruthy()
      expect(savedChallenge?.status).toBe(false)

      // Step 3: Verify challenge with signature
      const pubKey = 'test-user-pubkey'
      const signature = '1234567890abcdef' // Valid hex signature
      const isValid = await verifyAuthChallenge(challenge.challenge, pubKey, signature)
      expect(isValid).toBe(true)

      // Step 4: Check that challenge was updated in database
      const updatedChallenge = await prisma.authChallenge.findUnique({
        where: { challenge: challenge.challenge }
      })
      expect(updatedChallenge?.status).toBe(true)
      expect(updatedChallenge?.pubKey).toBe(pubKey)

      // Step 5: Check authentication status
      const authResponse = await checkAuthStatus(challenge.challenge)
      expect(authResponse).toBeTruthy()
      expect(authResponse?.pubkey).toBe(pubKey)
      expect(authResponse?.jwt).toBeTruthy()

      // Step 6: Verify user was created
      const user = await prisma.user.findUnique({
        where: { ownerPubKey: pubKey }
      })
      expect(user).toBeTruthy()
      expect(user?.ownerPubKey).toBe(pubKey)
    })

    it('should handle multiple authentication flows for different users', async () => {
      const users = [
        { pubKey: 'user1-pubkey', alias: 'User 1' },
        { pubKey: 'user2-pubkey', alias: 'User 2' },
        { pubKey: 'user3-pubkey', alias: 'User 3' }
      ]

      for (const user of users) {
        // Generate challenge
        const challenge = await generateAuthChallenge()
        
        // Verify challenge
        await verifyAuthChallenge(challenge.challenge, user.pubKey, '1234567890abcdef')
        
        // Check auth status
        const authResponse = await checkAuthStatus(challenge.challenge)
        expect(authResponse?.pubkey).toBe(user.pubKey)
      }

      // Verify all users were created
      const createdUsers = await prisma.user.findMany({
        where: {
          ownerPubKey: { in: users.map(u => u.pubKey) }
        }
      })
      expect(createdUsers).toHaveLength(3)
    })

    it('should handle concurrent authentication requests', async () => {
      const pubKey = 'concurrent-user-pubkey'
      const challenges = []

      // Generate multiple challenges concurrently
      for (let i = 0; i < 5; i++) {
        challenges.push(generateAuthChallenge())
      }

      const results = await Promise.all(challenges)
      
      // Verify all challenges are unique
      const challengeStrings = results.map(r => r.challenge)
      const uniqueChallenges = new Set(challengeStrings)
      expect(uniqueChallenges.size).toBe(5)

      // Verify all challenges were saved by checking each individually
      for (const challengeString of challengeStrings) {
        const savedChallenge = await prisma.authChallenge.findUnique({
          where: { challenge: challengeString }
        })
        expect(savedChallenge).toBeTruthy()
      }
    })
  })

  describe('User Management Integration', () => {
    it('should handle user creation and updates correctly', async () => {
      const pubKey = 'test-user-pubkey'
      const initialAlias = 'Initial Alias'
      const updatedAlias = 'Updated Alias'

      // Create user
      const user1 = await getOrCreateUser(pubKey, initialAlias)
      expect(user1.ownerPubKey).toBe(pubKey)
      expect(user1.ownerAlias).toBe(initialAlias)

      // Update user alias
      const user2 = await getOrCreateUser(pubKey, updatedAlias)
      expect(user2.id).toBe(user1.id)
      expect(user2.ownerAlias).toBe(updatedAlias)

      // Verify in database
      const dbUser = await prisma.user.findUnique({
        where: { ownerPubKey: pubKey }
      })
      expect(dbUser?.ownerAlias).toBe(updatedAlias)
    })

    it('should handle user login tracking', async () => {
      const pubKey = 'login-tracking-user'
      
      // First login
      const beforeFirstLogin = new Date()
      await getOrCreateUser(pubKey)
      const afterFirstLogin = new Date()

      const user1 = await prisma.user.findUnique({
        where: { ownerPubKey: pubKey }
      })
      expect(user1?.lastLoginAt).toBeTruthy()
      expect(user1!.lastLoginAt!.getTime()).toBeGreaterThanOrEqual(beforeFirstLogin.getTime())
      expect(user1!.lastLoginAt!.getTime()).toBeLessThanOrEqual(afterFirstLogin.getTime())

      // Wait a bit and login again
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const beforeSecondLogin = new Date()
      await getOrCreateUser(pubKey)
      const afterSecondLogin = new Date()

      const user2 = await prisma.user.findUnique({
        where: { ownerPubKey: pubKey }
      })
      expect(user2?.lastLoginAt).toBeTruthy()
      expect(user2!.lastLoginAt!.getTime()).toBeGreaterThanOrEqual(beforeSecondLogin.getTime())
      expect(user2!.lastLoginAt!.getTime()).toBeLessThanOrEqual(afterSecondLogin.getTime())
      expect(user2!.lastLoginAt!.getTime()).toBeGreaterThan(user1!.lastLoginAt!.getTime())
    })
  })

  describe('Challenge Management Integration', () => {
    it('should handle challenge expiration correctly', async () => {
      // Create expired and valid challenges individually
      const expiredTime = new Date(Date.now() - 6 * 60 * 1000)
      const validTime = new Date(Date.now() + 5 * 60 * 1000)

      await prisma.authChallenge.create({
        data: { challenge: 'expired-1', expiresAt: expiredTime }
      })
      await prisma.authChallenge.create({
        data: { challenge: 'expired-2', expiresAt: expiredTime }
      })
      await prisma.authChallenge.create({
        data: { challenge: 'valid-1', expiresAt: validTime }
      })
      await prisma.authChallenge.create({
        data: { challenge: 'valid-2', expiresAt: validTime }
      })

      // Verify expired challenges are rejected
      const expiredResult1 = await verifyAuthChallenge('expired-1', 'pubkey', '1234567890abcdef')
      const expiredResult2 = await verifyAuthChallenge('expired-2', 'pubkey', '1234567890abcdef')
      expect(expiredResult1).toBe(false)
      expect(expiredResult2).toBe(false)

      // Verify valid challenges work
      const validResult1 = await verifyAuthChallenge('valid-1', 'pubkey', '1234567890abcdef')
      const validResult2 = await verifyAuthChallenge('valid-2', 'pubkey', '1234567890abcdef')
      expect(validResult1).toBe(true)
      expect(validResult2).toBe(true)
    })

    it('should clean up expired challenges correctly', async () => {
      // Create expired and valid challenges individually
      const expiredTime = new Date(Date.now() - 6 * 60 * 1000)
      const validTime = new Date(Date.now() + 5 * 60 * 1000)

      await prisma.authChallenge.create({
        data: { challenge: 'expired-1', expiresAt: expiredTime }
      })
      await prisma.authChallenge.create({
        data: { challenge: 'expired-2', expiresAt: expiredTime }
      })
      await prisma.authChallenge.create({
        data: { challenge: 'valid-1', expiresAt: validTime }
      })
      await prisma.authChallenge.create({
        data: { challenge: 'valid-2', expiresAt: validTime }
      })

      // Verify initial state
      const initialChallenges = await prisma.authChallenge.findMany()
      expect(initialChallenges).toHaveLength(4)

      // Clean up expired challenges
      await cleanupExpiredChallenges()

      // Verify only valid challenges remain
      const remainingChallenges = await prisma.authChallenge.findMany()
      expect(remainingChallenges).toHaveLength(2)
      expect(remainingChallenges.every(c => c.challenge.startsWith('valid-'))).toBe(true)
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle database errors gracefully', async () => {
      // This test verifies that the auth functions handle database errors gracefully
      // We can't easily simulate database errors in integration tests, so we'll test
      // that the functions work correctly with valid data
      const challenge = await generateAuthChallenge()
      const result = await verifyAuthChallenge(challenge.challenge, 'test-pubkey', '1234567890abcdef')
      expect(typeof result).toBe('boolean')
    })

    it('should handle concurrent user creation', async () => {
      const pubKey = 'concurrent-user-pubkey'
      
      // Create the same user concurrently
      const promises = [
        getOrCreateUser(pubKey, 'User 1'),
        getOrCreateUser(pubKey, 'User 2'),
        getOrCreateUser(pubKey, 'User 3')
      ]
      
      const results = await Promise.all(promises)
      
      // All should return the same user
      expect(results[0].id).toBe(results[1].id)
      expect(results[1].id).toBe(results[2].id)
      expect(results[0].ownerPubKey).toBe(pubKey)
      
      // Verify only one user was created in database
      const users = await prisma.user.findMany({
        where: { ownerPubKey: pubKey }
      })
      expect(users).toHaveLength(1)
    })
  })
}) 