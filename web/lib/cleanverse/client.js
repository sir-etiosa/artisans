import { createCipheriv, randomUUID } from "crypto";

const BASE_URLS = {
  sandbox: "https://uatapi.cleanverse.com/api/cooperate",
  production: "https://api.cleanverse.com/api/cooperate",
};

const AES_ALGO_BY_KEY_LENGTH = { 16: "aes-128-cbc", 24: "aes-192-cbc", 32: "aes-256-cbc" };

export function isCleanverseConfigured() {
  return Boolean(process.env.CLEANVERSE_API_ID && process.env.CLEANVERSE_API_KEY);
}

function baseUrl() {
  return BASE_URLS[process.env.CLEANVERSE_ENV || "sandbox"];
}

// Write endpoints only — fixed zero IV, key = base64-decoded api-key, per
// Cleanverse's docs. Read/query endpoints (what we use today) send plain JSON.
function encryptBody(payload) {
  const key = Buffer.from(process.env.CLEANVERSE_API_KEY, "base64");
  const algo = AES_ALGO_BY_KEY_LENGTH[key.length];
  if (!algo) throw new Error(`Unexpected Cleanverse api-key length: ${key.length} bytes`);
  const iv = Buffer.alloc(16, 0);
  const cipher = createCipheriv(algo, key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  return { data: encrypted.toString("base64") };
}

/* Server-only. `encrypted: true` for write endpoints; query/read endpoints
   (the only kind we call so far) leave it false and send plain JSON. */
export async function cleanverseRequest(path, { body = {}, encrypted = false } = {}) {
  if (!isCleanverseConfigured()) {
    return { ok: false, notConfigured: true };
  }

  const res = await fetch(`${baseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-id": process.env.CLEANVERSE_API_ID,
      "X-Request-ID": randomUUID(),
    },
    body: JSON.stringify(encrypted ? encryptBody(body) : body),
  });

  const json = await res.json().catch(() => null);
  if (!json) return { ok: false, error: `Non-JSON response (HTTP ${res.status})` };

  return { ok: json.code === "0000", code: json.code, message: json.message, data: json.data };
}
