"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, CredentialCard, Meter } from "@/components/ui";
import { MUTED } from "@/lib/theme";

export default function ProfileSidebar({ sel }) {
  const router = useRouter();
  const [messaging, setMessaging] = useState(false);

  const messageFirst = async () => {
    setMessaging(true);
    const res = await fetch("/api/messages/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId: sel.id }),
    });
    const data = await res.json();
    if (res.ok) router.push(`/messages/${data.conversation.id}`);
    else setMessaging(false);
  };

  return (
    <div className="lg:sticky lg:top-24 space-y-5">
      <CredentialCard a={sel} />
      <div className="card soft p-5">
        <p className="text-sm font-semibold">{sel.rate}</p>
        <Btn primary className="w-full mt-3" onClick={() => router.push(`/book/${sel.id}`)}>
          Book {sel.name.split(" ")[0]}
        </Btn>
        <Btn className="w-full mt-2" small disabled={messaging} onClick={messageFirst}>
          {messaging ? "Starting…" : "Message first"}
        </Btn>
        <p className="text-[12px] mt-3 text-center" style={{ color: MUTED }}>Payment held in escrow · released when you confirm</p>
      </div>
      <div className="card soft p-5">
        <h2 className="disp font-bold text-[17px]">Trust Score · {sel.score}</h2>
        <Meter label="Job completion" v={sel.breakdown.completion} />
        <Meter label="Customer ratings" v={sel.breakdown.ratings} />
        <Meter label="Response time" v={sel.breakdown.response} />
        <Meter label="Repeat clients" v={sel.breakdown.repeat} />
        <p className="text-[12px] mt-4" style={{ color: MUTED }}>Recalculated after every completed job. This number can’t be bought.</p>
      </div>
    </div>
  );
}
