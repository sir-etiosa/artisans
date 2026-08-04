"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Seal } from "@/components/ui";
import ThemeToggle from "@/components/ThemeToggle";
import { PAPER, LINE, INK, FOREST, MUTED } from "@/lib/theme";

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  /* auth screen has its own full-bleed layout — just float the theme toggle */
  if (pathname === "/auth") return <ThemeToggle floating />;

  const isActive = (p) => pathname === p;

  return (
    <header
      className="sticky top-0 z-50 px-4 md:px-8 py-3 flex items-center justify-between gap-4"
      style={{ background: `color-mix(in srgb, ${PAPER} 94%, transparent)`, backdropFilter: "blur(8px)", borderBottom: `1px solid ${LINE}` }}
    >
      <Link href="/" className="flex items-center gap-2">
        <Seal size={30} />
        <span className="disp font-bold text-lg tracking-tight">The Artisans</span>
      </Link>
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: MUTED }} aria-label="Main">
        <Link href="/" className="hover:underline" style={{ color: isActive("/") ? INK : undefined }}>Find artisans</Link>
        <Link href="/search" className="hover:underline" style={{ color: isActive("/search") ? INK : undefined }}>Browse all</Link>
        <Link href="/dashboard" className="hover:underline" style={{ color: isActive("/dashboard") ? INK : undefined }}>Artisan dashboard</Link>
      </nav>
      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-[13px]" style={{ color: MUTED }}>Surulere, Lagos</span>
        <ThemeToggle />
        <button
          onClick={() => router.push("/auth")}
          className="disp font-bold flex items-center justify-center"
          style={{ width: 36, height: 36, borderRadius: 999, background: FOREST, color: "#fff" }}
          aria-label="Account"
        >
          RO
        </button>
      </div>
    </header>
  );
}
