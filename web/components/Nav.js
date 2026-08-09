"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import AccountMenu from "@/components/account-menu/AccountMenu";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { PAPER, LINE, INK, MUTED } from "@/lib/theme";

export default function Nav({ initialDark = false }) {
  const pathname = usePathname();
  const { user } = useCurrentUser();

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
        {/* Not gated on `user` — for a logged-out visitor these just bounce
            to /auth via the route guard, doubling as sign-up/login entry
            points instead of needing separate buttons. */}
        <Link href="/dashboard" className="hover:underline" style={{ color: isActive("/dashboard") ? INK : undefined }}>Artisan dashboard</Link>
        <Link href="/messages" className="hover:underline" style={{ color: isActive("/messages") ? INK : undefined }}>Messages</Link>
      </nav>
      <div className="flex items-center gap-3">
        {user && <NotificationBell />}
        <ThemeToggle initialDark={initialDark} />
        {user && <AccountMenu />}
      </div>
    </header>
  );
}
