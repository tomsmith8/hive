#!/usr/bin/env node

const { ECPairFactory } = require('ecpair');
const ecc = require('tiny-secp256k1');
const crypto = require('crypto');

// Initialize ECPair with secp256k1
const ECPair = ECPairFactory(ecc);

function generateTestKeys() {
  console.log('🔑 Generating valid Bitcoin test keys...\n');

  // Generate two key pairs
  const keyPair1 = ECPair.makeRandom();
  const keyPair2 = ECPair.makeRandom();

  // Get public keys in hex format
  const pubKey1 = Buffer.from(keyPair1.publicKey).toString('hex');
  const pubKey2 = Buffer.from(keyPair2.publicKey).toString('hex');

  // Create test challenges
  const challenge1 = crypto.randomBytes(32).toString('hex');
  const challenge2 = crypto.randomBytes(32).toString('hex');

  console.log('✅ Generated valid Bitcoin test data:\n');
  console.log('// Valid test data for integration tests');
  console.log(`const pubKey1 = '${pubKey1}';`);
  console.log(`const pubKey2 = '${pubKey2}';`);
  console.log(`const challenge1 = '${challenge1}';`);
  console.log(`const challenge2 = '${challenge2}';`);
  console.log(`const validSignature = '${crypto.randomBytes(65).toString('hex')}';`);
  console.log('\n📝 Copy these values to your test files and setup scripts.\n');

  // Verify the public keys are valid
  console.log('🔍 Verifying public keys...');
  const isValid1 = ecc.isPoint(Buffer.from(pubKey1, 'hex'));
  const isValid2 = ecc.isPoint(Buffer.from(pubKey2, 'hex'));
  
  console.log(`Public key 1 valid: ${isValid1}`);
  console.log(`Public key 2 valid: ${isValid2}`);
  
  if (isValid1 && isValid2) {
    console.log('✅ All public keys are valid!');
  } else {
    console.log('❌ Some public keys are invalid!');
  }
}

if (require.main === module) {
  generateTestKeys();
}

module.exports = { generateTestKeys }; 