import { CARD, FOREST, LINE, MUTED } from "@/lib/theme";
import { formatTimeAgo } from "@/lib/format-time-ago";

export default function MessageBubble({ message, mine }) {
  return (
    <div className="flex" style={{ justifyContent: mine ? "flex-end" : "flex-start" }}>
      <div
        className="px-4 py-2.5"
        style={{
          maxWidth: "75%",
          background: mine ? FOREST : CARD,
          color: mine ? "#fff" : "inherit",
          border: mine ? "none" : `1px solid ${LINE}`,
          borderRadius: 16,
          borderBottomRightRadius: mine ? 4 : 16,
          borderBottomLeftRadius: mine ? 16 : 4,
        }}
      >
        <p className="text-[14px] leading-relaxed" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{message.body}</p>
        <p className="text-[11px] mt-1" style={{ color: mine ? "#ffffff99" : MUTED }}>{formatTimeAgo(message.createdAt)}</p>
      </div>
    </div>
  );
}
