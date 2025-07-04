// Set up test environment variables BEFORE any imports
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only'

import { beforeAll, afterEach, afterAll, vi } from 'vitest'

// Mock the database module for unit tests
vi.mock('@/lib/db', () => ({
  prisma: {
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
      deleteMany: vi.fn(),
    },
  },
}))

// Global test setup for unit tests
beforeAll(async () => {
  // No database setup needed for unit tests
})

// Clean up after each test
afterEach(async () => {
  vi.clearAllMocks()
})

// Clean up after all tests
afterAll(async () => {
  // No cleanup needed for unit tests
}) 