const crypto = require("crypto");

// Algorithm for AES encryption
const algorithm = "aes-256-cbc";

// Access master key securely from environment variables
const masterKey = process.env.MASTER_KEY;
if (!masterKey) {
  throw new Error("MASTER_KEY is missing from environment variables.");
}

// Ensure masterKey is the correct length (256 bits)
const encryptionKey = Buffer.from(masterKey, "utf8");
if (encryptionKey.length !== 32) {
  throw new Error("MASTER_KEY must be exactly 32 characters (256 bits).");
}

/**
 * Encrypt a key using the master key
 * @param {string} key - The key to be encrypted
 * @returns {Object} - The encrypted key and initialization vector (IV)
 */
function encryptKey(key) {
  const iv = crypto.randomBytes(16); // Generate a random IV
  const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
  let encrypted = cipher.update(key, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { encrypted_key: encrypted, iv: iv.toString("hex") }; // Return the encrypted data and IV
}

/**
 * Decrypt an encrypted key using the master key
 * @param {string} encrypted_key - The encrypted key
 * @param {string} iv - The initialization vector (hex)
 * @returns {string} - The original decrypted key
 */
function decryptKey(encrypted_key, iv) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    encryptionKey,
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encrypted_key, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted; // Return the decrypted original key
}

// Export the functions for use in other parts of the application
module.exports = { encryptKey, decryptKey };
