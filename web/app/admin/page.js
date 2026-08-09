"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { BRASS, BRASS_SOFT, FOREST, MUTED } from "@/lib/theme";

function Card({ href, title, description, count, enabled, router }) {
  return (
    <button
      onClick={() => enabled && router.push(href)}
      className="card soft p-5 text-left w-full"
      style={{ opacity: enabled ? 1 : 0.4, cursor: enabled ? "pointer" : "not-allowed" }}
      disabled={!enabled}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="disp font-bold text-[16px]">{title}</h2>
        {enabled && count > 0 && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: BRASS_SOFT, color: FOREST, border: `1px solid ${BRASS}66` }}>
            {count} pending
          </span>
        )}
      </div>
      <p className="text-[13px] mt-1" style={{ color: MUTED }}>{description}</p>
    </button>
  );
}

function HubContent() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [counts, setCounts] = useState({});

  const canReview = user && (user.adminRole === "support" || user.adminRole === "full");
  const canApprove = user && (user.adminRole === "tx" || user.adminRole === "full");

  useEffect(() => {
    if (canReview) {
      fetch("/api/admin/verification-reviews").then((r) => r.json()).then((d) => setCounts((c) => ({ ...c, review: d.reviews?.length || 0 })));
    }
    if (canApprove) {
      fetch("/api/admin/deposits").then((r) => r.json()).then((d) => setCounts((c) => ({ ...c, deposits: d.deposits?.length || 0 })));
      fetch("/api/admin/withdrawals").then((r) => r.json()).then((d) => setCounts((c) => ({ ...c, withdrawals: d.withdrawals?.length || 0 })));
      fetch("/api/admin/bookings").then((r) => r.json()).then((d) => setCounts((c) => ({ ...c, bookings: d.bookings?.length || 0 })));
    }
  }, [canReview, canApprove]);

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <Card router={router} href="/admin/verification" enabled={canReview} count={counts.review}
        title="Identity review" description="Approve or reject submitted ID + photo verifications." />
      <Card router={router} href="/admin/deposits" enabled={canApprove} count={counts.deposits}
        title="Deposit approval" description="Paystack-confirmed deposits waiting for ART to be sent to the user's wallet." />
      <Card router={router} href="/admin/withdrawals" enabled={canApprove} count={counts.withdrawals}
        title="Withdrawal approval" description="Requests waiting for ART to return to treasury and a real Paystack payout." />
      <Card router={router} href="/admin/bookings" enabled={canApprove} count={counts.bookings}
        title="Booking disputes" description="Bookings holding real ART in escrow, stuck unresolved — release, refund, or split." />
      <Card router={router} href="/admin/audit" enabled={user?.adminRole === "full"}
        title="Audit log" description="Append-only, hash-chained record of every signup, verification decision, and money movement." />
    </div>
  );
}

export default function AdminHubPage() {
  return (
    <AdminShell>
      <HubContent />
    </AdminShell>
  );
}
