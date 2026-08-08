import { BRASS, BRASS_SOFT, FOREST, LINE, MUTED } from "@/lib/theme";
import { formatTimeAgo } from "@/lib/format-time-ago";

export default function ConversationRow({ conversation, onClick }) {
  const { other, lastMessage, unreadCount } = conversation;

  return (
    <button onClick={onClick} className="hoverable card soft w-full text-left p-4 flex items-center gap-3">
      <div className="disp shrink-0 flex items-center justify-center font-bold"
        style={{ width: 44, height: 44, borderRadius: 999, background: BRASS_SOFT, color: FOREST, border: `1px solid ${LINE}` }}>
        {other?.fullName?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-[15px] truncate">{other?.fullName || "Unknown user"}</p>
          {lastMessage && <span className="text-[12px] shrink-0" style={{ color: MUTED }}>{formatTimeAgo(lastMessage.createdAt)}</span>}
        </div>
        <p className="text-[13px] truncate mt-0.5" style={{ color: MUTED }}>
          {lastMessage ? `${lastMessage.mine ? "You: " : ""}${lastMessage.body}` : "No messages yet"}
        </p>
      </div>
      {unreadCount > 0 && (
        <span className="text-[11px] font-bold shrink-0 flex items-center justify-center"
          style={{ width: 20, height: 20, borderRadius: 999, background: BRASS, color: "#fff" }}>
          {unreadCount}
        </span>
      )}
    </button>
  );
}
