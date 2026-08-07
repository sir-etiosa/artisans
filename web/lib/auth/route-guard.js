import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./jwt";

const PUBLIC_PATHS = ["/auth", "/verify-email", "/forgot-password", "/reset-password"];

function isPublic(pathname) {
  return (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname.startsWith("/api/auth")
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
