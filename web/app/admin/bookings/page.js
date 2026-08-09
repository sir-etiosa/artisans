"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ui";
import { MUTED, RED, PINE, LINE } from "@/lib/theme";

export default function AdminBookingsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [bookings, setBookings] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [splitInputs, setSplitInputs] = useState({});

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.user.adminRole !== "tx" && data.user.adminRole !== "full") router.replace("/admin");
        else setAuthorized(true);
      })
      .catch(() => router.replace("/auth"));
  }, [router]);

  const load = () => {
    fetch("/api/admin/bookings")
      .then((res) => res.json())
      .then((data) => setBookings(data.bookings || []));
  };

  useEffect(() => { if (authorized) load(); }, [authorized]);

  const resolve = async (id, decision) => {
    setBusyId(id);
    setError(null);
    const body = { decision };
    if (decision === "split") body.artisanShareNaira = Number(splitInputs[id]) || 0;
    const res = await fetch(`/api/admin/bookings/${id}/resolve`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Couldn't resolve");
    else load();
    setBusyId(null);
  };

  if (!authorized) return null;

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-8 pt-8 pb-16">
      <Link href="/admin" className="text-sm font-semibold underline" style={{ color: PINE }}>← Admin</Link>
      <h1 className="disp font-bold mt-3" style={{ fontSize: "clamp(1.7rem,4vw,2.2rem)" }}>Booking disputes</h1>
      <p className="mt-1 text-[14px]" style={{ color: MUTED }}>
        Bookings currently holding real ART in escrow. Release pays the artisan (minus the 20% fee), refund returns
        everything to the customer, split lets you send the artisan any amount up to the full price — the rest
        refunds to the customer. Use this when a job is stuck unresolved past its scheduled date.
      </p>

      {error && <p className="text-[13px] font-medium mt-3" style={{ color: RED }}>{error}</p>}

      <div className="mt-6 card soft divide-y" style={{ borderColor: LINE }}>
        {!bookings && <p className="p-4 text-[13px]" style={{ color: MUTED }}>Loading…</p>}
        {bookings?.length === 0 && <p className="p-4 text-[13px]" style={{ color: MUTED }}>Nothing holding escrow right now.</p>}
        {bookings?.map((b) => (
          <div key={b.id} className="p-4">
            <p className="font-semibold text-[15px]">{b.customerName} → {b.artisanName}</p>
            <p className="text-[13px] mt-0.5" style={{ color: MUTED }}>{b.jobDescription}</p>
            <p className="text-[13px] mt-0.5" style={{ color: MUTED }}>
              ₦{b.amountNaira?.toLocaleString()} escrowed · {b.scheduledDate || "no date"} {b.scheduledTime} · {b.status}
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: MUTED, fontFamily: "monospace" }}>{b.escrowTxHash}</p>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Btn small primary disabled={busyId === b.id} onClick={() => resolve(b.id, "release")}>Release to artisan</Btn>
              <Btn small disabled={busyId === b.id} onClick={() => resolve(b.id, "refund")}>Refund customer</Btn>
              <input
                type="number" min="0" max={b.amountNaira} placeholder="₦ to artisan" className="field" style={{ width: 130, padding: "6px 10px" }}
                value={splitInputs[b.id] || ""} onChange={(e) => setSplitInputs((prev) => ({ ...prev, [b.id]: e.target.value }))}
              />
              <Btn small disabled={busyId === b.id} onClick={() => resolve(b.id, "split")}>Split</Btn>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
