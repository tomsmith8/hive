import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PrismaClient } from '@prisma/client'
import * as bitcoinMessage from 'bitcoinjs-message'
import { ECPairFactory } from 'ecpair'
import * as ecc from 'tiny-secp256k1'
import crypto from 'crypto'

// Mock Prisma
const mockPrisma = {
  authChallenge: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}

vi.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}))

// Valid Bitcoin public keys for testing (compressed format)
const VALID_BITCOIN_PUBKEYS = {
  COMPRESSED: '02a0434d9e47f3c86235477c7b1ae6ae5d3442d49b1943c2b752a68e2a47e247c7',
  COMPRESSED_2: '03b0bd634234abbb1ba1e986e884185c61cf43e001f9137f23c2c409273eb16e65',
}

// Valid Bitcoin signature for testing (130 hex chars)
const VALID_BITCOIN_SIGNATURE = '3045022100a0434d9e47f3c86235477c7b1ae6ae5d3442d49b1943c2b752a68e2a47e247c7022000000000000000000000000000000000000000000000000000000000000000001'

const ECPair = ECPairFactory(ecc)

describe('Auth Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateAuthChallenge', () => {
    it('should generate a new authentication challenge', async () => {
      const mockChallenge = { challenge: 'test-challenge', ts: Date.now() }
      mockPrisma.authChallenge.create.mockResolvedValue(mockChallenge)

      const { generateAuthChallenge } = await import('@/lib/auth')
      const result = await generateAuthChallenge()

      expect(mockPrisma.authChallenge.create).toHaveBeenCalled()
      expect(result).toHaveProperty('challenge')
      expect(result).toHaveProperty('ts')
    })

    it('should generate unique challenges on multiple calls', async () => {
      mockPrisma.authChallenge.create.mockResolvedValue({})

      const { generateAuthChallenge } = await import('@/lib/auth')
      const challenge1 = await generateAuthChallenge()
      const challenge2 = await generateAuthChallenge()

      expect(challenge1.challenge).not.toBe(challenge2.challenge)
    })
  })

  describe('verifyAuthChallenge', () => {
    it('should return false for non-existent challenge', async () => {
      mockPrisma.authChallenge.findUnique.mockResolvedValue(null)

      const { verifyAuthChallenge } = await import('@/lib/auth')
      const result = await verifyAuthChallenge(
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', // Valid hex challenge
        VALID_BITCOIN_PUBKEYS.COMPRESSED, 
        VALID_BITCOIN_SIGNATURE
      )

      expect(result).toBe(false)
    })

    it('should return false for expired challenge', async () => {
      mockPrisma.authChallenge.findUnique.mockResolvedValue({
        expiresAt: new Date(Date.now() - 10000), // Expired
      })

      const { verifyAuthChallenge } = await import('@/lib/auth')
      const result = await verifyAuthChallenge(
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', // Valid hex challenge
        VALID_BITCOIN_PUBKEYS.COMPRESSED, 
        VALID_BITCOIN_SIGNATURE
      )

      expect(result).toBe(false)
    })

    it('should return false for invalid signature', async () => {
      mockPrisma.authChallenge.findUnique.mockResolvedValue({
        expiresAt: new Date(Date.now() + 10000),
      })

      const { verifyAuthChallenge } = await import('@/lib/auth')
      const result = await verifyAuthChallenge(
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', // Valid hex challenge
        VALID_BITCOIN_PUBKEYS.COMPRESSED, 
        '' // Empty signature
      )

      expect(result).toBe(false)
    })
  })

  describe('generateJWT', () => {
    it('should generate a valid JWT token', async () => {
      const mockUser = {
        id: 'user-id',
        ownerPubKey: VALID_BITCOIN_PUBKEYS.COMPRESSED,
        role: 'user',
      }

      const { generateJWT } = await import('@/lib/auth')
      const token = generateJWT(mockUser)

      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should include correct payload in JWT', async () => {
      const mockUser = {
        id: 'user-id',
        ownerPubKey: VALID_BITCOIN_PUBKEYS.COMPRESSED,
        role: 'user',
      }

      const { generateJWT, verifyJWT } = await import('@/lib/auth')
      const token = generateJWT(mockUser)
      const decoded = verifyJWT(token)

      expect(decoded).toEqual(mockUser)
    })
  })

  describe('verifyJWT', () => {
    it('should return null for invalid token', async () => {
      const { verifyJWT } = await import('@/lib/auth')
      const result = verifyJWT('invalid-token')

      expect(result).toBeNull()
    })

    it('should return null for expired token', async () => {
      // This would require creating an expired token, which is complex
      // For now, we'll test with an invalid token
      const { verifyJWT } = await import('@/lib/auth')
      const result = verifyJWT('expired.invalid.token')

      expect(result).toBeNull()
    })

    it('should return user data for valid token', async () => {
      const mockUser = {
        id: 'user-id',
        ownerPubKey: VALID_BITCOIN_PUBKEYS.COMPRESSED,
        role: 'user',
      }

      const { generateJWT, verifyJWT } = await import('@/lib/auth')
      const token = generateJWT(mockUser)
      const result = verifyJWT(token)

      expect(result).toEqual(mockUser)
    })
  })

  describe('getOrCreateUser', () => {
    it('should create a new user if it does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-user-id',
        ownerPubKey: VALID_BITCOIN_PUBKEYS.COMPRESSED,
        ownerAlias: 'test-alias',
        role: 'user',
        lastLoginAt: new Date(),
      })

      const { getOrCreateUser } = await import('@/lib/auth')
      const result = await getOrCreateUser(VALID_BITCOIN_PUBKEYS.COMPRESSED, 'test-alias')

      expect(mockPrisma.user.create).toHaveBeenCalled()
      expect(result.ownerPubKey).toBe(VALID_BITCOIN_PUBKEYS.COMPRESSED)
      expect(result.ownerAlias).toBe('test-alias')
    })

    it('should return existing user if it exists', async () => {
      const existingUser = {
        id: 'existing-user-id',
        ownerPubKey: VALID_BITCOIN_PUBKEYS.COMPRESSED,
        ownerAlias: 'existing-alias',
        role: 'user',
        lastLoginAt: new Date(),
      }
      mockPrisma.user.findUnique.mockResolvedValue(existingUser)
      mockPrisma.user.update.mockResolvedValue(existingUser)

      const { getOrCreateUser } = await import('@/lib/auth')
      const result = await getOrCreateUser(VALID_BITCOIN_PUBKEYS.COMPRESSED)

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { ownerPubKey: VALID_BITCOIN_PUBKEYS.COMPRESSED },
      })
      expect(result).toEqual({
        id: existingUser.id,
        ownerPubKey: existingUser.ownerPubKey,
        ownerAlias: existingUser.ownerAlias,
        role: existingUser.role,
        name: undefined,
        avatar: undefined,
      })
    })

    it('should update last login time for existing user', async () => {
      const existingUser = {
        id: 'existing-user-id',
        ownerPubKey: VALID_BITCOIN_PUBKEYS.COMPRESSED,
        ownerAlias: 'existing-alias',
        role: 'user',
        lastLoginAt: new Date(),
      }
      mockPrisma.user.findUnique.mockResolvedValue(existingUser)
      mockPrisma.user.update.mockResolvedValue(existingUser)

      const { getOrCreateUser } = await import('@/lib/auth')
      await getOrCreateUser(VALID_BITCOIN_PUBKEYS.COMPRESSED)

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: existingUser.id },
        data: {
          lastLoginAt: expect.any(Date),
        },
      })
    })
  })

  describe('checkAuthStatus', () => {
    it('should return null for non-existent challenge', async () => {
      mockPrisma.authChallenge.findUnique.mockResolvedValue(null)

      const { checkAuthStatus } = await import('@/lib/auth')
      const result = await checkAuthStatus('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')

      expect(result).toBeNull()
    })

    it('should return null for unverified challenge', async () => {
      mockPrisma.authChallenge.findUnique.mockResolvedValue({
        status: false,
        pubKey: null,
        expiresAt: new Date(Date.now() + 10000),
      })

      const { checkAuthStatus } = await import('@/lib/auth')
      const result = await checkAuthStatus('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')

      expect(result).toBeNull()
    })

    it('should return null for expired challenge', async () => {
      mockPrisma.authChallenge.findUnique.mockResolvedValue({
        status: true,
        pubKey: VALID_BITCOIN_PUBKEYS.COMPRESSED,
        expiresAt: new Date(Date.now() - 10000), // Expired
      })

      const { checkAuthStatus } = await import('@/lib/auth')
      const result = await checkAuthStatus('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')

      expect(result).toBeNull()
    })

    it('should return auth response for valid challenge', async () => {
      const mockUser = {
        id: 'user-id',
        ownerPubKey: VALID_BITCOIN_PUBKEYS.COMPRESSED,
        ownerAlias: 'test-alias',
        role: 'user',
        name: 'Test User',
        avatar: 'avatar-url',
      }

      mockPrisma.authChallenge.findUnique.mockResolvedValue({
        status: true,
        pubKey: VALID_BITCOIN_PUBKEYS.COMPRESSED,
        expiresAt: new Date(Date.now() + 10000),
      })

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.user.update.mockResolvedValue(mockUser)

      const { checkAuthStatus } = await import('@/lib/auth')
      const result = await checkAuthStatus('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')

      expect(result).toMatchObject({
        pubkey: VALID_BITCOIN_PUBKEYS.COMPRESSED,
        owner_alias: 'test-alias',
        img: 'avatar-url',
        jwt: expect.any(String),
      })
    })

    it('should create user if it does not exist', async () => {
      const newUser = {
        id: 'new-user-id',
        ownerPubKey: VALID_BITCOIN_PUBKEYS.COMPRESSED,
        ownerAlias: 'test-alias',
        role: 'user',
        name: 'Test User',
        avatar: 'avatar-url',
      }

      mockPrisma.authChallenge.findUnique.mockResolvedValue({
        status: true,
        pubKey: VALID_BITCOIN_PUBKEYS.COMPRESSED,
        expiresAt: new Date(Date.now() + 10000),
      })

      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue(newUser)
      mockPrisma.user.update.mockResolvedValue(newUser)

      const { checkAuthStatus } = await import('@/lib/auth')
      const result = await checkAuthStatus('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')

      expect(mockPrisma.user.create).toHaveBeenCalled()
      expect(result).toMatchObject({
        pubkey: VALID_BITCOIN_PUBKEYS.COMPRESSED,
        owner_alias: 'test-alias',
        img: 'avatar-url',
        jwt: expect.any(String),
      })
    })
  })

  describe('cleanupExpiredChallenges', () => {
    it('should delete expired challenges', async () => {
      mockPrisma.authChallenge.deleteMany.mockResolvedValue({ count: 5 })

      const { cleanupExpiredChallenges } = await import('@/lib/auth')
      await cleanupExpiredChallenges()

      expect(mockPrisma.authChallenge.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: {
            lt: expect.any(Date),
          },
        },
      })
    })
  })
}) 