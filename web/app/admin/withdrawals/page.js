"use client";

import { useEffect, useState } from "react";
import { Btn } from "@/components/ui";
import AdminShell from "@/components/admin/AdminShell";
import { MUTED, RED, LINE } from "@/lib/theme";

function WithdrawalsContent() {
  const [rows, setRows] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    fetch("/api/admin/withdrawals")
      .then((res) => res.json())
      .then((data) => setRows(data.withdrawals || []));
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/admin/withdrawals/${id}/approve`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Couldn't approve");
    else load();
    setBusyId(null);
  };

  return (
    <>
      <h1 className="disp font-bold" style={{ fontSize: "clamp(1.5rem,3.5vw,1.9rem)" }}>Withdrawal approvals</h1>
      <p className="mt-1 text-[14px]" style={{ color: MUTED }}>
        Approving returns ART to treasury and pays out via a real Paystack transfer.
      </p>

      {error && <p className="text-[13px] font-medium mt-3" style={{ color: RED }}>{error}</p>}

      <div className="mt-6 card soft divide-y" style={{ borderColor: LINE }}>
        {!rows && <p className="p-4 text-[13px]" style={{ color: MUTED }}>Loading…</p>}
        {rows?.length === 0 && <p className="p-4 text-[13px]" style={{ color: MUTED }}>Nothing pending.</p>}
        {rows?.map((w) => (
          <div key={w.id} className="p-4 flex flex-wrap gap-3 justify-between items-center">
            <div>
              <p className="font-semibold text-[15px]">{w.userFullName} · {w.userEmail}</p>
              <p className="text-[13px] mt-0.5" style={{ color: MUTED }}>
                {w.artAmount} ART · ₦{(w.amountKobo / 100).toLocaleString()} · {new Date(w.createdAt).toLocaleString()}
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: MUTED }}>{w.accountName} · {w.bankName} · {w.accountNumber}</p>
            </div>
            <Btn small primary disabled={busyId === w.id} onClick={() => approve(w.id)}>
              {busyId === w.id ? "Processing…" : "Approve & pay out"}
            </Btn>
          </div>
        ))}
      </div>
    </>
  );
}

export default function AdminWithdrawalsPage() {
  return (
    <AdminShell allowedRoles={["tx"]}>
      <WithdrawalsContent />
    </AdminShell>
  );
}
