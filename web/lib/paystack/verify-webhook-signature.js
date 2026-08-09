import { createHmac, timingSafeEqual } from "crypto";

// HMAC-SHA512 of the raw request body, keyed with the secret key — per
// Paystack's docs. Must be computed over the exact raw bytes, not a
// re-serialized JSON.parse(...) round-trip, or the signature won't match.
export function verifyPaystackSignature(rawBody, signatureHeader) {
  if (!signatureHeader) return false;
  const expected = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(rawBody, "utf8").digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const givenBuf = Buffer.from(signatureHeader, "hex");
  if (expectedBuf.length !== givenBuf.length) return false;
  return timingSafeEqual(expectedBuf, givenBuf);
}
