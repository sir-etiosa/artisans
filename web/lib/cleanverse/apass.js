import { cleanverseRequest } from "./client";

const CHAIN = "monad";
const VALID_YEARS = 5;

/* customerId must be >=12 chars, [A-Za-z0-9] only — strip the UUID's hyphens. */
export function customerIdForUser(userId) {
  return `U${userId.replace(/-/g, "")}`.slice(0, 32);
}

export async function generateApass({ userId, walletAddress }) {
  const expirationTime = Math.floor(Date.now() / 1000) + VALID_YEARS * 365 * 24 * 60 * 60;
  return cleanverseRequest("/generate_apass", {
    encrypted: true,
    body: {
      customerId: customerIdForUser(userId),
      expirationTime,
      wallet: { address: walletAddress, chain: CHAIN },
    },
  });
}

export async function queryApass({ walletAddress }) {
  return cleanverseRequest("/query_apass", {
    body: { chain: CHAIN, address: walletAddress },
  });
}

// A-Pass status: 1 = active, 2 = frozen. "0002" = no A-Pass registered yet
// for this wallet (confirmed live against sandbox — data comes back as "").
const STATUS_MAP = { 1: "verified", 2: "frozen" };
const NOT_FOUND_CODE = "0002";

export function normalizeApassStatus(queryResult) {
  if (queryResult.code === NOT_FOUND_CODE) {
    return { status: "not_connected", raw: null };
  }
  if (!queryResult.ok) {
    return { status: "error", raw: { code: queryResult.code, message: queryResult.message || queryResult.error } };
  }
  const data = queryResult.data;
  if (!data || data.cvRecordId == null) return { status: "not_connected", raw: null };
  return { status: STATUS_MAP[data.status] || "unknown", raw: data };
}
