import { SignJWT, jwtVerify } from "jose";

/* Edge-safe: no next/headers here, so middleware.js can import this
   directly. Session-cookie reading/writing for Route Handlers and
   Server Components lives in ./session.js instead. */

export const SESSION_COOKIE_NAME = "artisans_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set — add it to web/.env.local");
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload;
  } catch {
    return null;
  }
}
