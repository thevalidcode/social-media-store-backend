
import crypto from "crypto";
import { env } from "../config/env.config";

// AES encryption algorithm to use
const algorithm = "aes-256-cbc";

// Access the master key from environment variables
const masterKey = env.MASTER_KEY;
if (!masterKey) {
  throw new Error("MASTER_KEY is missing from environment variables.");
}

// Validate key length: AES-256 requires 32 bytes (256 bits)
const encryptionKey = Buffer.from(masterKey, "utf8");
if (encryptionKey.length !== 32) {
  throw new Error("MASTER_KEY must be exactly 32 characters (256 bits).");
}

// Define output types for encryption
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
function encryptKey(key: string): EncryptedResult {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);

  let encrypted = cipher.update(key, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    encrypted_key: encrypted,
    iv: iv.toString("hex"),
  };
}

/**
 * Decrypts an encrypted key using AES-256-CBC.
 *
 * @param encrypted_key - The encrypted key in hexadecimal format
 * @param iv - The initialization vector in hexadecimal format
 * @returns The decrypted original plaintext key
 */
function decryptKey(encrypted_key: string, iv: string): string {
  const decipher = crypto.createDecipheriv(
    algorithm,
    encryptionKey,
    Buffer.from(iv, "hex")
  );

  let decrypted = decipher.update(encrypted_key, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export { encryptKey, decryptKey };
