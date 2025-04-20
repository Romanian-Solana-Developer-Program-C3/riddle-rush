import * as crypto from "crypto";

/**
 * Encrypts a string with a nonce using SHA-256.
 * @param input The string to encrypt.
 * @param nonce The nonce to use for encryption.
 * @returns An array of bytes (Uint8Array) representing the encrypted value.
 */
export function encrypt(input: string, nonce: number): Uint8Array {
  // Concatenate the input string and the nonce
  const data = `${input}${nonce}`;

  // Hash the concatenated string using SHA-256
  const hash = crypto.createHash("sha256").update(data).digest();

  // Convert the hash to a Uint8Array
  return new Uint8Array(hash);
}