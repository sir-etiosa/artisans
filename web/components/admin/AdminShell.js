"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CARD, FOREST, LINE, MUTED, PINE } from "@/lib/theme";

const ROLE_LABELS = { support: "Support admin", tx: "Tx admin", full: "Full admin" };

const SECTIONS = [
  { href: "/admin", label: "Hub", roles: ["support", "tx", "full"] },
  { href: "/admin/verification", label: "Identity", roles: ["support", "full"] },
  { href: "/admin/deposits", label: "Deposits", roles: ["tx", "full"] },
  { href: "/admin/withdrawals", label: "Withdrawals", roles: ["tx", "full"] },
  { href: "/admin/bookings", label: "Disputes", roles: ["tx", "full"] },
  { href: "/admin/audit", label: "Audit log", roles: ["full"] },
];

// Shared chrome for every /admin/* page: one auth+role check instead of
// six copies of it, a persistent sub-nav so an admin isn't clicking back
// to the hub between every section, and the role badge always visible.
export default function AdminShell({ allowedRoles, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!data.user.adminRole) {
          router.replace("/");
          return;
        }
        if (allowedRoles && data.user.adminRole !== "full" && !allowedRoles.includes(data.user.adminRole)) {
          router.replace("/admin");
          return;
        }
        setUser(data.user);
      })
      .catch(() => router.replace("/auth"));
  }, [router, allowedRoles]);

  if (!user) return null;

  const visibleSections = SECTIONS.filter((s) => user.adminRole === "full" || s.roles.includes(user.adminRole));

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-8 pt-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="disp font-bold text-xl">Admin</span>
          <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ background: FOREST, color: "#fff" }}>
            {ROLE_LABELS[user.adminRole]}
          </span>
        </div>
        <Link href="/" className="text-[13px] font-semibold underline" style={{ color: PINE }}>Exit to site</Link>
      </div>

      <nav className="flex flex-wrap gap-2 mt-5 pb-5" style={{ borderBottom: `1px solid ${LINE}` }} aria-label="Admin sections">
        {visibleSections.map((s) => {
          const active = pathname === s.href;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="text-[13px] font-semibold px-3.5 py-1.5 rounded-full"
              style={{
                background: active ? FOREST : CARD,
                color: active ? "#fff" : MUTED,
                border: `1px solid ${active ? FOREST : LINE}`,
              }}
            >
              {s.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6">{children}</div>
    </main>
  );
}
