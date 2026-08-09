"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ui";

// Reused anywhere someone might need a human: the messages list, and any
// booking that's stuck or disputed — `note` prefills context (which
// booking, what's wrong) so support doesn't start from zero.
export default function MessageSupportButton({ note, small, children = "Message support" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    const res = await fetch("/api/messages/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    if (res.status === 401) {
      router.push("/auth?tab=login");
      return;
    }
    const data = await res.json();
    if (res.ok) router.push(`/messages/${data.conversationId}`);
    setLoading(false);
  };

  return (
    <Btn small={small} disabled={loading} onClick={start}>
      {loading ? "…" : children}
    </Btn>
  );
}
