#!/usr/bin/env node

const { ECPairFactory } = require('ecpair');
const ecc = require('tiny-secp256k1');
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');
const crypto = require('crypto');

const ECPair = ECPairFactory(ecc);

function generateTestSignature() {
  console.log('🔑 Generating real Bitcoin signature for test data...\n');

  // Generate a random key pair
  const keyPair = ECPair.makeRandom();
  const pubKey = Buffer.from(keyPair.publicKey).toString('hex');
  const privKeyWIF = keyPair.toWIF();

  // Get the Bitcoin address (P2PKH)
  const pubKeyBuffer = Buffer.from(keyPair.publicKey);
  const { address } = bitcoin.payments.p2pkh({ pubkey: pubKeyBuffer });

  // Create a test challenge (32 bytes hex)
  const challenge = crypto.randomBytes(32).toString('hex');

  // Sign the challenge using bitcoinjs-message
  const signature = bitcoinMessage.sign(
    challenge,
    keyPair.privateKey,
    keyPair.compressed
  ).toString('hex');

  console.log('✅ Generated real Bitcoin signature:\n');
  console.log('// Real signature for test data');
  console.log(`const pubKey1 = '${pubKey}';`);
  console.log(`const address1 = '${address}';`);
  console.log(`const privKeyWIF = '${privKeyWIF}'; // For reference, not needed in tests`);
  console.log(`const challenge1 = '${challenge}';`);
  console.log(`const validSignature = '${signature}';`);
  console.log('\n📝 Copy these values to your test files and setup scripts.\n');

  // Verify the signature works (use address for verification)
  const isValid = bitcoinMessage.verify(
    challenge,
    address,
    Buffer.from(signature, 'hex')
  );
  console.log(`Signature valid: ${isValid}`);
  if (isValid) {
    console.log('✅ Signature verification successful!');
  } else {
    console.log('❌ Signature verification failed!');
  }
}

function generateTestSignatureFor(pubKeyHex, privKeyWIF, challengeHex) {
  const ECPair = ECPairFactory(ecc);
  const keyPair = ECPair.fromWIF(privKeyWIF);
  const pubKey = Buffer.from(keyPair.publicKey).toString('hex');
  if (pubKey !== pubKeyHex) {
    throw new Error('Provided pubKey does not match private key');
  }
  const signature = bitcoinMessage.sign(
    challengeHex,
    keyPair.privateKey,
    keyPair.compressed
  ).toString('hex');
  console.log(`// Signature for pubKey: ${pubKeyHex}, challenge: ${challengeHex}`);
  console.log(`const validSignature2 = '${signature}';`);
  const address = bitcoin.payments.p2pkh({ pubkey: Buffer.from(pubKeyHex, 'hex') }).address;
  const isValid = bitcoinMessage.verify(
    challengeHex,
    address,
    Buffer.from(signature, 'hex')
  );
  console.log(`Signature valid: ${isValid}`);
}

if (require.main === module) {
  generateTestSignature();
  // User 2 test values:
  // pubKey2 and challenge2 from test data
  const pubKey2 = '02be0f7b80cfd2b3d89012c19e286437d90c192bd26e814fd5c90d6090c0a9bff2';
  const privKeyWIF2 = 'Ky7d7v6Qw1Qn6Qw1Qn6Qw1Qn6Qw1Qn6Qw1Qn6Qw1Qn6Qw1Qn6Qw'; // <-- Replace with real WIF for pubKey2
  const challenge2 = '344308201b1c8a7af19f36bcddcb011921b8d6c7ec189b0427823a0872aef535';
  // Uncomment and set real privKeyWIF2 if you want to generate signature for user 2
  // generateTestSignatureFor(pubKey2, privKeyWIF2, challenge2);
}

module.exports = { generateTestSignature }; 