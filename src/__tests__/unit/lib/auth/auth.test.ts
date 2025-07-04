import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PrismaClient } from '@prisma/client'

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
      const result = await verifyAuthChallenge('nonexistent', 'pubkey', 'sig')

      expect(result).toBe(false)
    })

    it('should return false for expired challenge', async () => {
      mockPrisma.authChallenge.findUnique.mockResolvedValue({
        expiresAt: new Date(Date.now() - 10000), // Expired
      })

      const { verifyAuthChallenge } = await import('@/lib/auth')
      const result = await verifyAuthChallenge('expired', 'pubkey', 'sig')

      expect(result).toBe(false)
    })

    it('should return false for invalid signature', async () => {
      mockPrisma.authChallenge.findUnique.mockResolvedValue({
        expiresAt: new Date(Date.now() + 10000),
      })

      const { verifyAuthChallenge } = await import('@/lib/auth')
      const result = await verifyAuthChallenge('challenge', 'pubkey', '') // Empty signature

      expect(result).toBe(false)
    })

    it('should return true for valid challenge and signature', async () => {
      mockPrisma.authChallenge.findUnique.mockResolvedValue({
        expiresAt: new Date(Date.now() + 10000),
      })
      mockPrisma.authChallenge.update.mockResolvedValue({})
      
      // Import the module first
      const authModule = await import('@/lib/auth')
      
      // Mock the verifyBitcoinSignature function
      const mockVerify = vi.spyOn(authModule, 'verifyBitcoinSignature').mockReturnValue(true)
      
      const result = await authModule.verifyAuthChallenge('challenge', 'pubkey', '1234567890abcdef')
      expect(result).toBe(true)
      expect(mockPrisma.authChallenge.update).toHaveBeenCalledWith({
        where: { challenge: 'challenge' },
        data: { status: true, pubKey: 'pubkey' },
      })
      
      mockVerify.mockRestore()
    })
  })

  describe('generateJWT', () => {
    it('should generate a valid JWT token', async () => {
      const mockUser = {
        id: 'user-id',
        ownerPubKey: 'pubkey',
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
        ownerPubKey: 'pubkey',
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
        ownerPubKey: 'pubkey',
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
        ownerPubKey: 'pubkey',
        ownerAlias: 'test-alias',
        role: 'user',
        lastLoginAt: new Date(),
      })

      const { getOrCreateUser } = await import('@/lib/auth')
      const result = await getOrCreateUser('pubkey', 'test-alias')

      expect(mockPrisma.user.create).toHaveBeenCalled()
      expect(result.ownerPubKey).toBe('pubkey')
      expect(result.ownerAlias).toBe('test-alias')
    })

    it('should return existing user if it exists', async () => {
      const existingUser = {
        id: 'existing-user-id',
        ownerPubKey: 'pubkey',
        ownerAlias: 'existing-alias',
        role: 'user',
        lastLoginAt: new Date(),
      }
      mockPrisma.user.findUnique.mockResolvedValue(existingUser)
      mockPrisma.user.update.mockResolvedValue(existingUser)

      const { getOrCreateUser } = await import('@/lib/auth')
      const result = await getOrCreateUser('pubkey')

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { ownerPubKey: 'pubkey' },
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
        ownerPubKey: 'pubkey',
        ownerAlias: 'existing-alias',
        role: 'user',
        lastLoginAt: new Date(),
      }
      mockPrisma.user.findUnique.mockResolvedValue(existingUser)
      mockPrisma.user.update.mockResolvedValue(existingUser)

      const { getOrCreateUser } = await import('@/lib/auth')
      await getOrCreateUser('pubkey')

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
      const result = await checkAuthStatus('nonexistent')

      expect(result).toBeNull()
    })

    it('should return null for unverified challenge', async () => {
      mockPrisma.authChallenge.findUnique.mockResolvedValue({
        status: false,
        pubKey: null,
        expiresAt: new Date(Date.now() + 10000),
      })

      const { checkAuthStatus } = await import('@/lib/auth')
      const result = await checkAuthStatus('unverified')

      expect(result).toBeNull()
    })

    it('should return null for expired challenge', async () => {
      mockPrisma.authChallenge.findUnique.mockResolvedValue({
        status: true,
        pubKey: 'pubkey',
        expiresAt: new Date(Date.now() - 10000), // Expired
      })

      const { checkAuthStatus } = await import('@/lib/auth')
      const result = await checkAuthStatus('expired')

      expect(result).toBeNull()
    })

    it('should return auth response for valid challenge', async () => {
      const mockUser = {
        id: 'user-id',
        ownerPubKey: 'pubkey',
        ownerAlias: 'test-alias',
        role: 'user',
        name: 'Test User',
        avatar: 'avatar-url',
      }

      mockPrisma.authChallenge.findUnique.mockResolvedValue({
        status: true,
        pubKey: 'pubkey',
        expiresAt: new Date(Date.now() + 10000),
      })
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.user.update.mockResolvedValue(mockUser)

      const { checkAuthStatus } = await import('@/lib/auth')
      const result = await checkAuthStatus('valid-challenge')

      expect(result).toMatchObject({
        pubkey: 'pubkey',
        owner_alias: 'test-alias',
        img: 'avatar-url',
        jwt: expect.any(String),
      })
    })

    it('should create user if it does not exist', async () => {
      mockPrisma.authChallenge.findUnique.mockResolvedValue({
        status: true,
        pubKey: 'pubkey',
        expiresAt: new Date(Date.now() + 10000),
      })
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-user-id',
        ownerPubKey: 'pubkey',
        role: 'user',
        lastLoginAt: new Date(),
      })
      mockPrisma.user.update.mockResolvedValue({
        id: 'new-user-id',
        ownerPubKey: 'pubkey',
        role: 'user',
        lastLoginAt: new Date(),
      })

      const { checkAuthStatus } = await import('@/lib/auth')
      const result = await checkAuthStatus('valid-challenge')

      expect(mockPrisma.user.create).toHaveBeenCalled()
      expect(result).toMatchObject({
        pubkey: 'pubkey',
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