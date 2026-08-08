"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ui";
import { BRASS, BRASS_SOFT, CARD, FOREST, INK, LINE, MUTED, PAPER, PINE } from "@/lib/theme";

export default function BookingRequests({ requests, onChanged }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState(null);

  const respond = async (id, status) => {
    setBusyId(id);
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) onChanged();
    setBusyId(null);
  };

  const chat = async (customerId) => {
    const res = await fetch("/api/messages/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId: customerId }),
    });
    const data = await res.json();
    if (res.ok) router.push(`/messages/${data.conversation.id}`);
  };

  return (
    <section className="lg:col-span-2 card soft p-6">
      <h2 className="disp font-bold text-[17px]">Booking requests</h2>
      {requests.length === 0 && <p className="text-[13px] mt-3" style={{ color: MUTED }}>No requests yet.</p>}
      {requests.map((r) => {
        const isNew = r.status === "pending";
        return (
          <div key={r.id} className="mt-4 p-4 rounded-xl flex flex-wrap gap-3 justify-between items-center"
            style={{ background: isNew ? PAPER : CARD, border: `1px solid ${LINE}` }}>
            <div>
              <p className="font-semibold text-[15px]">
                {r.customerName}{" "}
                {isNew && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full align-middle" style={{ background: BRASS_SOFT, color: FOREST, border: `1px solid ${BRASS}66` }}>
                    NEW
                  </span>
                )}
              </p>
              <p className="text-[13px] mt-0.5" style={{ color: MUTED }}>{r.jobDescription}</p>
              <p className="text-[13px] mt-0.5" style={{ color: MUTED }}>
                {r.scheduledDate || "Date TBD"} · {r.scheduledTime} · <b style={{ color: INK }}>{r.amount || "—"}</b> ·{" "}
                <span style={{ color: PINE }}>{r.status === "pending" ? "in escrow ✓" : r.status}</span>
              </p>
            </div>
            <div className="flex gap-2">
              {r.status === "pending" && (
                <>
                  <Btn small primary disabled={busyId === r.id} onClick={() => respond(r.id, "accepted")}>Accept</Btn>
                  <Btn small disabled={busyId === r.id} onClick={() => respond(r.id, "declined")}>Decline</Btn>
                </>
              )}
              <Btn small onClick={() => chat(r.customerId)}>Chat</Btn>
            </div>
          </div>
        );
      })}
    </section>
  );
}
