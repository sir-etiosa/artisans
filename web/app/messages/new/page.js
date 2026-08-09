"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LINE, MUTED, PINE } from "@/lib/theme";

export default function NewMessagePage() {
  const router = useRouter();
  const [users, setUsers] = useState(null);
  const [starting, setStarting] = useState(null);

  useEffect(() => {
    fetch("/api/messages/users")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setUsers(data.users))
      .catch(() => router.replace("/auth"));
  }, [router]);

  const startConversation = async (otherUserId) => {
    setStarting(otherUserId);
    const res = await fetch("/api/messages/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId }),
    });
    const data = await res.json();
    if (res.ok) router.push(`/messages/${data.conversation.id}`);
    else setStarting(null);
  };

  return (
    <main className="max-w-2xl mx-auto px-4 md:px-8 pt-8">
      <button onClick={() => router.push("/messages")} className="text-sm font-semibold underline" style={{ color: PINE }}>← Back to messages</button>
      <h1 className="disp font-bold mt-3" style={{ fontSize: "clamp(1.7rem,4vw,2.2rem)" }}>New message</h1>
      <p className="text-[14px] mt-1" style={{ color: MUTED }}>Pick someone to message.</p>

      <div className="mt-5 card soft divide-y" style={{ borderColor: LINE }}>
        {users === null && <p className="p-4 text-[14px]" style={{ color: MUTED }}>Loading…</p>}
        {users?.length === 0 && <p className="p-4 text-[14px]" style={{ color: MUTED }}>No other users registered yet.</p>}
        {users?.map((u) => (
          <button key={u.id} disabled={starting === u.id} onClick={() => startConversation(u.id)}
            className="hoverable w-full text-left p-4 flex items-center justify-between gap-3"
            style={{ opacity: starting && starting !== u.id ? 0.5 : 1 }}>
            <div>
              <p className="font-semibold text-[15px]">{u.fullName}</p>
              <p className="text-[13px]" style={{ color: MUTED }}>{u.role === "artisan" ? "Artisan" : "Customer"}</p>
            </div>
            <span className="text-[13px] font-semibold" style={{ color: PINE }}>{starting === u.id ? "Starting…" : "Message"}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
