"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import AccountMenu from "@/components/account-menu/AccountMenu";
import { PAPER, LINE, INK, MUTED, CARD } from "@/lib/theme";

export default function Nav({ initialDark = false, initialLoggedIn = false }) {
  const pathname = usePathname();
  // Comes straight from the server (layout.js verifies the session cookie
  // on every real navigation), not a client fetch — a client fetch only
  // resolves once and then goes stale the moment login/logout changes the
  // cookie under it. router.refresh() after login/logout re-runs layout.js
  // and hands down a fresh value here, which is what actually keeps this
  // in sync without a manual page reload.
  const loggedIn = initialLoggedIn;

  /* auth screen has its own full-bleed layout — just float the theme toggle */
  if (pathname === "/auth") return <ThemeToggle floating initialDark={initialDark} />;

  const isActive = (p) => pathname === p;

  return (
    <header
      className="sticky top-0 z-50 px-4 md:px-8 py-3 flex items-center justify-between gap-4"
      style={{ background: `color-mix(in srgb, ${PAPER} 94%, transparent)`, backdropFilter: "blur(8px)", borderBottom: `1px solid ${LINE}` }}
    >
      <Link href="/" className="flex items-center gap-2">
        <Logo size={30} />
        <span className="disp font-bold text-lg tracking-tight">The Artisans</span>
      </Link>
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: MUTED }} aria-label="Main">
        <Link href="/" className="hover:underline" style={{ color: isActive("/") ? INK : undefined }}>Find artisans</Link>
        <Link href="/search" className="hover:underline" style={{ color: isActive("/search") ? INK : undefined }}>Browse all</Link>
        <Link href="/goods" className="hover:underline" style={{ color: isActive("/goods") ? INK : undefined }}>Goods</Link>
        {loggedIn && (
          <>
            <Link href="/dashboard" className="hover:underline" style={{ color: isActive("/dashboard") ? INK : undefined }}>Artisan dashboard</Link>
            <Link href="/messages" className="hover:underline" style={{ color: isActive("/messages") ? INK : undefined }}>Messages</Link>
          </>
        )}
        {!loggedIn && (
          <>
            <Link href="/auth?tab=login" className="hover:underline">Log in</Link>
            <Link href="/auth" className="hover:underline">Sign up</Link>
          </>
        )}
      </nav>
      <div className="flex items-center gap-3">
        {loggedIn && <NotificationBell />}
        {/* Desktop nav already has Log in/Sign up links (hidden below md) —
            this is the only way in on mobile, so it needs to exist here too,
            just much smaller than the icon buttons next to it. */}
        {!loggedIn && (
          <Link
            href="/auth"
            className="md:hidden font-semibold whitespace-nowrap"
            style={{
              fontSize: 11, lineHeight: 1, padding: "8px 10px", borderRadius: 999,
              background: CARD, border: `1px solid ${LINE}`, color: INK,
            }}
          >
            Log in / Sign up
          </Link>
        )}
        <ThemeToggle initialDark={initialDark} />
        {loggedIn && <AccountMenu />}
      </div>
    </header>
  );
}
