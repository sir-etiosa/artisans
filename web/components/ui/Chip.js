import { FOREST, CARD, LINE, MUTED } from "@/lib/theme";

export default function Chip({ children, active, ...p }) {
  return (
    <button
      className="btn text-sm font-medium px-3.5 py-1.5"
      style={{
        borderRadius: 999,
        background: active ? FOREST : CARD,
        color: active ? "#fff" : MUTED,
        border: `1px solid ${active ? FOREST : LINE}`,
      }}
      {...p}
    >
      {children}
    </button>
  );
}
