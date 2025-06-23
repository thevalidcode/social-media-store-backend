interface EncryptedResult {
    encrypted_key: string;
    iv: string;
}
/**
 * Encrypts a plaintext key using AES-256-CBC.
 *
 * @param key - The plaintext key to encrypt
 * @returns An object containing the encrypted key and the IV used
 */
declare function encryptKey(key: string): EncryptedResult;
/**
 * Decrypts an encrypted key using AES-256-CBC.
 *
 * @param encrypted_key - The encrypted key in hexadecimal format
 * @param iv - The initialization vector in hexadecimal format
 * @returns The decrypted original plaintext key
 */
declare function decryptKey(encrypted_key: string, iv: string): string;
export { encryptKey, decryptKey };
