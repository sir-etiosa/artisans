"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chip } from "@/components/ui";
import { PINE, MUTED } from "@/lib/theme";
import ProfileInfo from "./_components/ProfileInfo";
import WalletCard from "./_components/WalletCard";
import ChangePasswordForm from "./_components/ChangePasswordForm";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "wallet", label: "Wallet" },
  { id: "password", label: "Change password" },
];

function AccountPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const tab = TABS.some((t) => t.id === searchParams.get("tab")) ? searchParams.get("tab") : "profile";

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setUser(data.user))
      .catch(() => router.replace("/auth"));
  }, [router]);

  const changeTab = (id) => router.push(id === "profile" ? "/account" : `/account?tab=${id}`);

  return (
    <main className="max-w-2xl mx-auto px-4 md:px-8 pt-8">
      <button onClick={() => router.back()} className="text-sm font-semibold underline" style={{ color: PINE }}>← Back</button>
      <h1 className="disp font-bold mt-3" style={{ fontSize: "clamp(1.7rem,4vw,2.2rem)" }}>Account &amp; settings</h1>

      <div className="flex flex-wrap gap-2 mt-5" role="tablist" aria-label="Account sections">
        {TABS.map((t) => (
          <Chip key={t.id} role="tab" aria-selected={tab === t.id} active={tab === t.id} onClick={() => changeTab(t.id)}>
            {t.label}
          </Chip>
        ))}
      </div>

      {!user ? (
        <p className="mt-5 text-[14px]" style={{ color: MUTED }}>Loading…</p>
      ) : (
        <div className="mt-5">
          {tab === "profile" && <ProfileInfo user={user} onUserUpdate={setUser} />}
          {tab === "wallet" && <WalletCard user={user} />}
          {tab === "password" && <ChangePasswordForm />}
        </div>
      )}
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountPageInner />
    </Suspense>
  );
}
