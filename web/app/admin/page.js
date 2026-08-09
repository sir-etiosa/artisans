"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MUTED } from "@/lib/theme";

const ROLE_LABELS = { support: "Support admin", tx: "Tx admin", full: "Full admin" };

export default function AdminHubPage() {
  const router = useRouter();
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!data.user.adminRole) router.replace("/");
        else setUser(data.user);
      })
      .catch(() => router.replace("/auth"));
  }, [router]);

  if (!user) return null;

  const canReview = user.adminRole === "support" || user.adminRole === "full";
  const canApproveDeposits = user.adminRole === "tx" || user.adminRole === "full";

  return (
    <main className="max-w-2xl mx-auto px-4 md:px-8 pt-8 pb-16">
      <h1 className="disp font-bold" style={{ fontSize: "clamp(1.7rem,4vw,2.2rem)" }}>Admin</h1>
      <p className="mt-1 text-[14px]" style={{ color: MUTED }}>Signed in as {ROLE_LABELS[user.adminRole]}.</p>

      <div className="mt-6 space-y-3">
        <a href={canReview ? "/admin/verification" : undefined}
          className="card soft p-5 block"
          style={{ opacity: canReview ? 1 : 0.4, pointerEvents: canReview ? "auto" : "none" }}>
          <h2 className="disp font-bold text-[16px]">Identity review</h2>
          <p className="text-[13px] mt-1" style={{ color: MUTED }}>Approve or reject submitted ID + photo verifications.</p>
        </a>

        <div className="card soft p-5" style={{ opacity: canApproveDeposits ? 1 : 0.4, borderStyle: canApproveDeposits ? "solid" : "dashed" }}>
          <h2 className="disp font-bold text-[16px]">Deposit approval</h2>
          <p className="text-[13px] mt-1" style={{ color: MUTED }}>
            {canApproveDeposits ? "Coming soon — Paystack deposits will land here for approval before ART is sent." : "Not available for your role."}
          </p>
        </div>
      </div>
    </main>
  );
}
