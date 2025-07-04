#!/usr/bin/env node

const { execSync } = require('child_process');
const { PrismaClient } = require('../src/generated/prisma');

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5433/hive_test';

async function setupTestDatabase() {
  console.log('🚀 Setting up test database...');
  
  // Debug: Print the database URL being used
  console.log('📊 Database URL:', TEST_DATABASE_URL);
  
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

    // Run Prisma migrations
    console.log('📦 Running Prisma migrations...');
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      stdio: 'inherit'
    });

    // Clean up any existing test data
    console.log('🧹 Cleaning up existing test data...');
    await prisma.authChallenge.deleteMany();
    await prisma.user.deleteMany();

    // Create some test users for integration tests
    console.log('👥 Creating test users...');
    const testUsers = [
      {
        ownerPubKey: '02ef82655be122df173e66ffce5ef845ed2defe04489eed3ba8f20afa2df4c0ab7',
        ownerAlias: 'test-user-1',
        role: 'USER',
        name: 'Test User 1',
        description: 'Test user for integration tests',
      },
      {
        ownerPubKey: '02be0f7b80cfd2b3d89012c19e286437d90c192bd26e814fd5c90d6090c0a9bff2',
        ownerAlias: 'test-user-2',
        role: 'ADMIN',
        name: 'Test Admin',
        description: 'Test admin user for integration tests',
      },
    ];

    for (const userData of testUsers) {
      await prisma.user.upsert({
        where: { ownerPubKey: userData.ownerPubKey },
        update: userData,
        create: userData,
      });
    }

    // Create some test auth challenges
    console.log('🔐 Creating test auth challenges...');
    const testChallenges = [
      {
        challenge: 'b7ee6b7d497cb21df2101e1a3f3b85322ab8c4d5a496b05de9dcb50995f04ae1',
        pubKey: '02ef82655be122df173e66ffce5ef845ed2defe04489eed3ba8f20afa2df4c0ab7',
        status: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      {
        challenge: '344308201b1c8a7af19f36bcddcb011921b8d6c7ec189b0427823a0872aef535',
        pubKey: '02be0f7b80cfd2b3d89012c19e286437d90c192bd26e814fd5c90d6090c0a9bff2',
        status: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    ];

    for (const challengeData of testChallenges) {
      await prisma.authChallenge.upsert({
        where: { challenge: challengeData.challenge },
        update: challengeData,
        create: challengeData,
      });
    }

    await prisma.$disconnect();
    console.log('✅ Test database setup complete!');
    console.log(`📊 Database URL: ${TEST_DATABASE_URL}`);
    console.log('🧪 You can now run integration tests with: npm run test:integration');

  } catch (error) {
    console.error('❌ Error setting up test database:', error);
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupTestDatabase();
}

module.exports = { setupTestDatabase }; 