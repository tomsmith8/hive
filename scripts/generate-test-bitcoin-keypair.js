const bitcoin = require('bitcoinjs-lib');
const { ECPairFactory } = require('ecpair');
const ecc = require('tiny-secp256k1');

const ECPair = ECPairFactory(ecc);

// Generate a random keypair (testnet)
const keyPair = ECPair.makeRandom({ network: bitcoin.networks.testnet });
const pubkeyBuffer = Buffer.from(keyPair.publicKey);
const { address } = bitcoin.payments.p2pkh({ pubkey: pubkeyBuffer, network: bitcoin.networks.testnet });

console.log('WIF:', keyPair.toWIF());
console.log('Public Key:', pubkeyBuffer.toString('hex'));
console.log('Address:', address); 