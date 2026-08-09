"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CARD, LINE, INK, MUTED, BRASS, FOREST } from "@/lib/theme";

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then(setData);
  }, []);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const messageCount = data?.unreadMessages.reduce((sum, m) => sum + m.unreadCount, 0) || 0;
  const requestCount = data?.bookingRequests.length || 0;
  const total = messageCount + requestCount;
  const empty = data && total === 0 && data.bookingUpdates.length === 0;

  const goTo = (path) => { setOpen(false); router.push(path); };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="btn flex items-center justify-center relative"
        style={{ width: 36, height: 36, borderRadius: 999, background: CARD, border: `1px solid ${LINE}`, color: INK, fontSize: 16 }}
      >
        🔔
        {total > 0 && (
          <span
            className="absolute -top-1 -right-1 text-[10px] font-bold rounded-full flex items-center justify-center"
            style={{ width: 16, height: 16, background: BRASS, color: FOREST }}
          >
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-xl overflow-hidden z-50"
          style={{ background: CARD, border: `1px solid ${LINE}`, boxShadow: "0 12px 32px -8px rgba(15,37,89,.25)" }}
        >
          <div className="max-h-96 overflow-y-auto">
            {!data && <p className="p-4 text-[13px]" style={{ color: MUTED }}>Loading…</p>}
            {empty && <p className="p-4 text-[13px]" style={{ color: MUTED }}>Nothing new.</p>}

            {data?.unreadMessages.map((m) => (
              <button key={m.conversationId} onClick={() => goTo(`/messages/${m.conversationId}`)}
                className="hoverable w-full text-left p-3 text-[13px]" style={{ borderBottom: `1px solid ${LINE}` }}>
                <b>{m.fromName}</b> sent {m.unreadCount} new message{m.unreadCount === 1 ? "" : "s"}
              </button>
            ))}
            {data?.bookingRequests.map((r) => (
              <button key={r.id} onClick={() => goTo("/dashboard")}
                className="hoverable w-full text-left p-3 text-[13px]" style={{ borderBottom: `1px solid ${LINE}` }}>
                New booking request from <b>{r.customerName}</b> — {r.jobDescription}
              </button>
            ))}
            {data?.bookingUpdates.map((u) => (
              <div key={u.id} className="p-3 text-[13px]" style={{ borderBottom: `1px solid ${LINE}`, color: MUTED }}>
                Booking {u.status === "completed" ? "completed ✓" : "confirmed"} — {u.jobDescription}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
