// Set up test environment variables BEFORE any imports
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only'

import { beforeAll, afterEach, afterAll } from 'vitest'
import { PrismaClient } from '@/generated/prisma'

// Extend global types
declare global {
  var prisma: PrismaClient
}

// For integration tests, we need a real database
// You can set this to your test database URL
const DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/hive_test'

// Create a test Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
})

// Global test setup for integration tests
beforeAll(async () => {
  try {
    // Test the connection
    await prisma.$connect()
    
    // Clean up database before all tests
    await prisma.authChallenge.deleteMany()
    await prisma.user.deleteMany()
  } catch (error) {
    console.warn('⚠️  Integration tests require a test database.')
    console.warn('Set TEST_DATABASE_URL environment variable or create a test database.')
    console.warn('Skipping integration tests...')
    throw new Error('Test database not available')
  }
})

// Clean up after each test
afterEach(async () => {
  try {
    await prisma.authChallenge.deleteMany()
    await prisma.user.deleteMany()
  } catch (error) {
    // Ignore cleanup errors
  }
})

// Clean up after all tests
afterAll(async () => {
  try {
    await prisma.$disconnect()
  } catch (error) {
    // Ignore disconnect errors
  }
})

// Make prisma available globally for tests
global.prisma = prisma 