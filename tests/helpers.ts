import pkg from 'js-sha3';
const { keccak_256 } = pkg;


/**
 * Encrypts a string with a nonce using SHA-256.
 * @param input The string to encrypt.
 * @param nonce The nonce to use for encryption.
 * @returns An array of bytes (Uint8Array) representing the encrypted value.
 */
export function encrypt(input: string, nonce: string): Uint8Array {
  // Concatenate the input string and the nonce
  const data = `${input}${nonce}`;

  // Hash the concatenated string using SHA-256
  const hashHex = keccak_256(data);

  // Convert the hash (hex string) to a Uint8Array
  const hashBytes = new Uint8Array(hashHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  return hashBytes;
}