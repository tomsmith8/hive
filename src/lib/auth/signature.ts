// ============================================================================
// SIGNATURE VERIFICATION
// ============================================================================

import crypto from 'crypto';
import * as bitcoin from 'bitcoinjs-lib';
import * as bitcoinMessage from 'bitcoinjs-message';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';

// Initialize ECPair with secp256k1
const ECPair = ECPairFactory(ecc);

// Bitcoin message prefix for signed messages (matches Bitcoin Core)
const SIGNED_MSG_PREFIX = Buffer.from('Bitcoin Signed Message:\n');

export function verifyBitcoinSignature(message: Buffer, pubKey: string, signature: Buffer): boolean {
  try {
    // Basic validation
    if (!message || !pubKey || !signature) {
      return false;
    }
    
    // Validate public key format (should be hex string)
    if (!/^[0-9a-fA-F]+$/.test(pubKey)) {
      return false;
    }
    
    // Validate signature length (should be 65 bytes for compact signature)
    if (signature.length !== 65) {
      return false;
    }
    
    // Convert public key to Bitcoin address for verification
    const pubKeyBuffer = Buffer.from(pubKey, 'hex');
    const { address } = bitcoin.payments.p2pkh({ pubkey: pubKeyBuffer });
    
    if (!address) {
      console.error('Failed to generate Bitcoin address from public key');
      return false;
    }
    
    // Use bitcoinjs-message for verification (more reliable and secure)
    const isValid = bitcoinMessage.verify(message, address, signature);
    
    return isValid;
    
  } catch (error) {
    console.error('Bitcoin signature verification error:', error);
    return false;
  }
}

// Alternative implementation for different signature formats
export function verifyBitcoinSignatureDER(message: Buffer, pubKey: string, signature: Buffer): boolean {
  try {
    if (!message || !pubKey || !signature) {
      return false;
    }
    
    // Create the message to verify
    const messageToVerify = Buffer.concat([SIGNED_MSG_PREFIX, message]);
    const messageHash = crypto.createHash('sha256').update(messageToVerify).digest();
    const doubleHash = crypto.createHash('sha256').update(messageHash).digest();
    
    // Convert public key from hex to Buffer
    const pubKeyBuffer = Buffer.from(pubKey, 'hex');
    
    // Use crypto.verify for ECDSA verification with DER signature
    const verify = crypto.createVerify('SHA256');
    verify.update(doubleHash);
    
    return verify.verify(pubKeyBuffer, signature);
    
  } catch (error) {
    console.error('DER Bitcoin signature verification error:', error);
    return false;
  }
}

// Utility function to validate Bitcoin address format
export function validateBitcoinAddress(address: string): boolean {
  try {
    // Try to decode the address using bitcoinjs-lib
    bitcoin.address.toOutputScript(address);
    return true;
  } catch (error) {
    return false;
  }
}

// Utility function to validate public key format
export function validateBitcoinPublicKey(pubKey: string): boolean {
  try {
    // Check if it's a valid hex string
    if (!/^[0-9a-fA-F]+$/.test(pubKey)) {
      return false;
    }
    
    // Check length (compressed: 33 bytes = 66 chars, uncompressed: 65 bytes = 130 chars)
    if (pubKey.length !== 66 && pubKey.length !== 130) {
      return false;
    }
    
    // Try to parse as public key using tiny-secp256k1
    const pubKeyBuffer = Buffer.from(pubKey, 'hex');
    return ecc.isPoint(pubKeyBuffer);
    
  } catch (error) {
    return false;
  }
} 