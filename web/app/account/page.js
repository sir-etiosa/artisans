"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PINE, MUTED } from "@/lib/theme";
import ProfileInfo from "./_components/ProfileInfo";
import ChangePasswordForm from "./_components/ChangePasswordForm";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setUser(data.user))
      .catch(() => router.replace("/auth"));
  }, [router]);

  return (
    <main className="max-w-2xl mx-auto px-4 md:px-8 pt-8">
      <button onClick={() => router.back()} className="text-sm font-semibold underline" style={{ color: PINE }}>← Back</button>
      <h1 className="disp font-bold mt-3" style={{ fontSize: "clamp(1.7rem,4vw,2.2rem)" }}>Account &amp; settings</h1>

      {!user ? (
        <p className="mt-4 text-[14px]" style={{ color: MUTED }}>Loading…</p>
      ) : (
        <div className="space-y-5 mt-5">
          <ProfileInfo user={user} onUserUpdate={setUser} />
          <ChangePasswordForm />
        </div>
      )}
    </main>
  );
}
