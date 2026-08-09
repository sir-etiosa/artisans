"use client";

import { useParams, useRouter } from "next/navigation";
import { LINE, MUTED, PINE } from "@/lib/theme";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { useThread } from "./_hooks/useThread";
import MessageBubble from "./_components/MessageBubble";
import Composer from "./_components/Composer";

export default function ThreadPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useCurrentUser();
  const { conversation, messages, send, sending } = useThread(id);

  return (
    <main className="max-w-2xl mx-auto px-4 md:px-8 pt-8 flex flex-col" style={{ minHeight: "calc(100vh - 200px)" }}>
      <button onClick={() => router.push("/messages")} className="text-sm font-semibold underline" style={{ color: PINE }}>← Messages</button>

      <div className="flex items-center gap-2 mt-3 pb-4" style={{ borderBottom: `1px solid ${LINE}` }}>
        <h1 className="disp font-bold text-xl">{conversation?.other?.fullName || "…"}</h1>
      </div>

      <div className="flex-1 space-y-3 py-4 overflow-y-auto">
        {messages.length === 0 && <p className="text-[14px] text-center mt-8" style={{ color: MUTED }}>No messages yet — say hi.</p>}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} mine={user && m.senderId === user.id} />
        ))}
      </div>

      <Composer onSend={send} sending={sending} />
    </main>
  );
}
