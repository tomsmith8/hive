import { beforeAll, afterEach, afterAll } from 'vitest'
import { PrismaClient } from '@/generated/prisma'

// Extend global types
declare global {
  var prisma: PrismaClient
}

// Set up test environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/hive_test'

// Create a test Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Global test setup
beforeAll(async () => {
  // Clean up database before all tests
  await prisma.authChallenge.deleteMany()
  await prisma.user.deleteMany()
})

// Clean up after each test
afterEach(async () => {
  await prisma.authChallenge.deleteMany()
  await prisma.user.deleteMany()
})

// Clean up after all tests
afterAll(async () => {
  await prisma.$disconnect()
})

// Make prisma available globally for tests
global.prisma = prisma 