import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./jwt";

const PUBLIC_PATHS = [
  "/auth", "/verify-email", "/forgot-password", "/reset-password", "/privacy",
  // Browsing before signup — anyone can look, only booking/posting/messaging
  // etc. require an account.
  "/", "/search", "/goods", "/artisan",
];

function isPublic(pathname) {
  return (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname.startsWith("/api/auth") ||
    // Server-to-server callback — no session cookie exists to check.
    // Authenticity is verified inside the route via the HMAC signature header.
    pathname === "/api/paystack/webhook" ||
    // Public browse endpoints — anyone can look before signing up. Routes
    // under these that DO require a session (posting, editing, deleting)
    // check getSession() themselves and return 401, same as every other
    // protected route; this only stops the middleware force-redirecting
    // logged-out browsing to /auth.
    pathname.startsWith("/api/artisans") ||
    pathname.startsWith("/api/goods")
  );
}

/* Redirects to /auth when there's no valid session cookie. Called from the
   root-level proxy.js — see that file for why the logic lives here instead. */
export async function requireSession(request) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
