"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ui";
import { MUTED } from "@/lib/theme";
import ConversationRow from "./_components/ConversationRow";

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState(null);

  useEffect(() => {
    fetch("/api/messages/conversations")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setConversations(data.conversations))
      .catch(() => router.replace("/auth"));
  }, [router]);

  return (
    <main className="max-w-2xl mx-auto px-4 md:px-8 pt-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="disp font-bold" style={{ fontSize: "clamp(1.7rem,4vw,2.2rem)" }}>Messages</h1>
        <Btn primary small onClick={() => router.push("/messages/new")}>New message</Btn>
      </div>

      <div className="space-y-3 mt-5">
        {conversations === null && <p className="text-[14px]" style={{ color: MUTED }}>Loading…</p>}
        {conversations?.length === 0 && (
          <div className="card p-6 text-[14px]" style={{ color: MUTED }}>
            No conversations yet. Start one from “New message”.
          </div>
        )}
        {conversations?.map((c) => (
          <ConversationRow key={c.id} conversation={c} onClick={() => router.push(`/messages/${c.id}`)} />
        ))}
      </div>
    </main>
  );
}
