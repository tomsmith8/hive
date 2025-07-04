// ============================================================================
// SIGNATURE VERIFICATION
// ============================================================================

import crypto from 'crypto';
import * as bitcoin from 'bitcoinjs-lib';
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
    
    // Create the message to verify (prefix + message)
    const messageToVerify = Buffer.concat([SIGNED_MSG_PREFIX, message]);
    
    // Double SHA256 hash the message (Bitcoin standard)
    const messageHash = crypto.createHash('sha256').update(messageToVerify).digest();
    const doubleHash = crypto.createHash('sha256').update(messageHash).digest();
    
    // Extract recovery ID and signature components
    const recoveryId = signature[0] - 27;
    const r = signature.slice(1, 33);
    const s = signature.slice(33, 65);
    
    // Verify recovery ID is valid (0-3)
    if (recoveryId < 0 || recoveryId > 3) {
      return false;
    }
    
    // Recover public key from signature using tiny-secp256k1
    const recoveredPubKey = recoverPublicKey(doubleHash, r, s, recoveryId);
    
    if (!recoveredPubKey) {
      return false;
    }
    
    // Compare recovered public key with provided public key
    return recoveredPubKey.toLowerCase() === pubKey.toLowerCase();
    
  } catch (error) {
    console.error('Bitcoin signature verification error:', error);
    return false;
  }
}

function recoverPublicKey(hash: Buffer, r: Buffer, s: Buffer, recoveryId: number): string | null {
  try {
    // Use tiny-secp256k1 for ECDSA recovery
    const signature = Buffer.concat([r, s]);
    const recoveredPubKey = ecc.recover(hash, signature, recoveryId as 0 | 1 | 2 | 3, true);
    
    if (!recoveredPubKey) {
      return null;
    }
    
    // Return the public key in hex format
    return Buffer.from(recoveredPubKey).toString('hex');
    
  } catch (error) {
    console.error('Public key recovery error:', error);
    return null;
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