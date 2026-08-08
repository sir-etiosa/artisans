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

// A-Pass status per docs: 1 = active, 2 = frozen. No record yet = not_connected.
const STATUS_MAP = { 1: "verified", 2: "frozen" };

export function normalizeApassStatus(queryResult) {
  if (!queryResult.ok) {
    return { status: "error", raw: { code: queryResult.code, message: queryResult.message || queryResult.error } };
  }
  const item = queryResult.data?.items?.[0];
  if (!item) return { status: "not_connected", raw: null };
  return { status: STATUS_MAP[item.status] || "unknown", raw: item };
}
