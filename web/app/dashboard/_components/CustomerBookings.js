"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ui";
import { BRASS_SOFT, FOREST, INK, LINE, MUTED, PINE } from "@/lib/theme";
import MessageSupportButton from "@/components/MessageSupportButton";

export default function CustomerBookings({ bookings, onChanged }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState(null);

  const setStatus = async (id, status) => {
    setBusyId(id);
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) onChanged();
    setBusyId(null);
  };

  const chat = async (artisanUserId) => {
    const res = await fetch("/api/messages/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId: artisanUserId }),
    });
    const data = await res.json();
    if (res.ok) router.push(`/messages/${data.conversation.id}`);
  };

  return (
    <section className="card soft p-6">
      <h2 className="disp font-bold text-[17px]">Your bookings</h2>
      {bookings.length === 0 && <p className="text-[13px] mt-3" style={{ color: MUTED }}>You haven&apos;t booked anyone yet.</p>}
      {bookings.map((b) => (
        <div key={b.id} className="mt-4 p-4 rounded-xl" style={{ border: `1px solid ${LINE}` }}>
          <p className="font-semibold text-[15px]">
            {b.artisanName}{" "}
            {b.status === "accepted" && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full align-middle" style={{ background: BRASS_SOFT, color: FOREST }}>
                IN PROGRESS
              </span>
            )}
          </p>
          <p className="text-[13px] mt-0.5" style={{ color: MUTED }}>{b.jobDescription}</p>
          <p className="text-[13px] mt-0.5" style={{ color: MUTED }}>
            {b.scheduledDate || "Date TBD"} · {b.scheduledTime} · <b style={{ color: INK }}>{b.amount || "—"}</b> ·{" "}
            <span style={{ color: PINE }}>{b.status}</span>
          </p>
          {b.status === "completed" && b.payoutNaira != null && (
            <p className="text-[13px] mt-0.5" style={{ color: MUTED }}>
              ₦{b.platformFeeNaira.toLocaleString()} platform fee · {b.artisanName.split(" ")[0]} received ₦{b.payoutNaira.toLocaleString()}
            </p>
          )}
          <div className="flex gap-2 mt-3">
            {b.status === "accepted" && (
              <Btn small primary disabled={busyId === b.id} onClick={() => setStatus(b.id, "completed")}>Job done</Btn>
            )}
            {b.status === "pending" && (
              <Btn small disabled={busyId === b.id} onClick={() => setStatus(b.id, "cancelled")}>Cancel</Btn>
            )}
            <Btn small onClick={() => chat(b.artisanUserId)}>Chat</Btn>
            <MessageSupportButton small note={`Need help with a booking (${b.jobDescription}) with ${b.artisanName}, booking ID ${b.id}.`}>
              Loop in support
            </MessageSupportButton>
          </div>
        </div>
      ))}
    </section>
  );
}
