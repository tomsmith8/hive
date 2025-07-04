#!/usr/bin/env node

const { PrismaClient } = require('../src/generated/prisma');

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5433/hive_test';

async function cleanupTestDatabase() {
  console.log('🧹 Cleaning up test database...');
  
  try {
    // Create test Prisma client
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: TEST_DATABASE_URL,
        },
      },
    });

    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to test database');

    // Clean up all test data
    console.log('🗑️  Removing all test data...');
    await prisma.authChallenge.deleteMany();
    await prisma.user.deleteMany();

    await prisma.$disconnect();
    console.log('✅ Test database cleanup complete!');

  } catch (error) {
    console.error('❌ Error cleaning up test database:', error);
    process.exit(1);
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  cleanupTestDatabase();
}

module.exports = { cleanupTestDatabase }; 