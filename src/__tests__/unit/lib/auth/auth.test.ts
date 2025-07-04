import { describe, it, expect, beforeEach, vi } from 'vitest'

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

// Test data
const VALID_BITCOIN_PUBKEYS = {
  COMPRESSED: '02be0f7b80cfd2b3d89012c19e286437d90c192bd26e814fd5c90d6090c0a9bff2',
  UNCOMPRESSED: '04be0f7b80cfd2b3d89012c19e286437d90c192bd26e814fd5c90d6090c0a9bff2',
}

const VALID_BITCOIN_SIGNATURE = '1f368eeeec0640708f4a2c37fd403b98e52321c99cdc886a8d487651620250ba3311115d6dea5ebee090403a2721addbc2c4a523e9e351d8f076466f15ae80ede8'

describe('Auth Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateAuthChallenge', () => {
    it('should generate a valid challenge', async () => {
      mockPrisma.authChallenge.create.mockResolvedValue({
        id: 'challenge-id',
        challenge: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        expiresAt: new Date(Date.now() + 300000),
      })

      const { generateAuthChallenge } = await import('@/lib/auth')
      const result = await generateAuthChallenge()

      expect(result.challenge).toMatch(/^[0-9a-f]{64}$/)
      expect(result.ts).toBeGreaterThan(0)
      expect(mockPrisma.authChallenge.create).toHaveBeenCalled()
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
        expiresAt: new Date(Date.now() + 10000),
      })

      const { checkAuthStatus } = await import('@/lib/auth')
      const result = await checkAuthStatus('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')

      expect(result).toBeNull()
    })

    it('should return user data for verified challenge', async () => {
      const existingUser = {
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

      mockPrisma.user.findUnique.mockResolvedValue(existingUser)
      mockPrisma.user.update.mockResolvedValue(existingUser)

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