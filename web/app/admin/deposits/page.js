"use client";

import { useEffect, useState } from "react";
import { Btn } from "@/components/ui";
import AdminShell from "@/components/admin/AdminShell";
import { MUTED, RED, LINE } from "@/lib/theme";

function DepositsContent() {
  const [deposits, setDeposits] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    fetch("/api/admin/deposits")
      .then((res) => res.json())
      .then((data) => setDeposits(data.deposits || []));
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/admin/deposits/${id}/approve`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Couldn't approve");
    else load();
    setBusyId(null);
  };

  return (
    <>
      <h1 className="disp font-bold" style={{ fontSize: "clamp(1.5rem,3.5vw,1.9rem)" }}>Deposit approvals</h1>
      <p className="mt-1 text-[14px]" style={{ color: MUTED }}>
        Paystack has confirmed these payments — approving sends ART to the user&apos;s wallet.
      </p>

      {error && <p className="text-[13px] font-medium mt-3" style={{ color: RED }}>{error}</p>}

      <div className="mt-6 card soft divide-y" style={{ borderColor: LINE }}>
        {!deposits && <p className="p-4 text-[13px]" style={{ color: MUTED }}>Loading…</p>}
        {deposits?.length === 0 && <p className="p-4 text-[13px]" style={{ color: MUTED }}>Nothing pending.</p>}
        {deposits?.map((d) => (
          <div key={d.id} className="p-4 flex flex-wrap gap-3 justify-between items-center">
            <div>
              <p className="font-semibold text-[15px]">{d.userFullName} · {d.userEmail}</p>
              <p className="text-[13px] mt-0.5" style={{ color: MUTED }}>
                ₦{(d.amountKobo / 100).toLocaleString()} · {d.reference} · {new Date(d.createdAt).toLocaleString()}
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: MUTED, fontFamily: "monospace" }}>{d.walletAddress || "no wallet"}</p>
            </div>
            <Btn small primary disabled={busyId === d.id} onClick={() => approve(d.id)}>
              {busyId === d.id ? "Sending…" : "Approve & send ART"}
            </Btn>
          </div>
        ))}
      </div>
    </>
  );
}

export default function AdminDepositsPage() {
  return (
    <AdminShell allowedRoles={["tx"]}>
      <DepositsContent />
    </AdminShell>
  );
}
