"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ui";
import { LINE, MUTED, BRASS, BRASS_SOFT, FOREST } from "@/lib/theme";

export default function GoodsCard({ g }) {
  const router = useRouter();
  const [messaging, setMessaging] = useState(false);

  const messageSeller = async () => {
    setMessaging(true);
    try {
      const res = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: g.sellerId }),
      });
      if (res.status === 401) {
        router.push("/auth?tab=login");
        return;
      }
      const data = await res.json();
      if (res.ok) router.push(`/messages/${data.conversation.id}`);
    } finally {
      setMessaging(false);
    }
  };

  return (
    <article className="hoverable card soft p-5">
      <div className="flex gap-3.5 min-w-0">
        {g.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={g.images[0]} alt={g.name} className="shrink-0 object-cover" style={{ width: 72, height: 72, borderRadius: 12, border: `1px solid ${LINE}` }} />
        ) : (
          <div className="shrink-0" style={{ width: 72, height: 72, borderRadius: 12, background: LINE }} />
        )}
        <div className="min-w-0">
          <p className="disp font-bold text-lg leading-tight truncate">
            {g.name}{" "}
            {g.condition === "new" && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full align-middle" style={{ background: BRASS_SOFT, color: FOREST, border: `1px solid ${BRASS}66` }}>
                NEW
              </span>
            )}
          </p>
          <p className="text-[13px] mt-0.5" style={{ color: MUTED }}>
            {g.km != null ? `${g.km} km · ` : ""}{g.sellerArea || "Location not set"}
          </p>
          <p className="text-[13px] mt-1" style={{ color: MUTED }}>by {g.sellerName}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 flex-wrap gap-3" style={{ borderTop: `1px solid ${LINE}` }}>
        <span className="text-sm font-semibold">₦{g.priceNaira.toLocaleString()}</span>
        <Btn small onClick={messageSeller} disabled={messaging}>{messaging ? "…" : "Message seller"}</Btn>
      </div>
    </article>
  );
}
