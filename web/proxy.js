/* Next.js requires this file at the project root with this exact name —
   it cannot be moved. The actual auth-gate logic lives in
   lib/auth/route-guard.js; this is just the required entrypoint. The
   matcher below must stay a static literal here (Next statically analyzes
   it at build time, see docs/api-reference/file-conventions/proxy). */
import { requireSession } from "@/lib/auth/route-guard";

export const proxy = requireSession;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
