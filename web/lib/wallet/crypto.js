import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

function masterKey() {
  const key = Buffer.from(process.env.WALLET_ENCRYPTION_KEY, "base64");
  if (key.length !== 32) throw new Error("WALLET_ENCRYPTION_KEY must decode to 32 bytes");
  return key;
}

/* AES-256-GCM. Output packs iv(12) + authTag(16) + ciphertext, base64-encoded.
   Server-only — never import this from a Client Component. */
export function encryptPrivateKey(privateKeyHex) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", masterKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(privateKeyHex, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

export function decryptPrivateKey(encoded) {
  const raw = Buffer.from(encoded, "base64");
  const iv = raw.subarray(0, 12);
  const authTag = raw.subarray(12, 28);
  const ciphertext = raw.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", masterKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
