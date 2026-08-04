import { FOREST, INK, CARD, LINE } from "@/lib/theme";

export default function Btn({ children, primary, ghost, small, className = "", style = {}, ...p }) {
  return (
    <button
      className={`btn font-semibold ${small ? "text-sm px-4 py-2" : "px-6 py-3"} ${className}`}
      style={{
        borderRadius: 999,
        background: primary ? FOREST : ghost ? "transparent" : CARD,
        color: primary ? "#fff" : INK,
        border: primary ? `1px solid ${FOREST}` : `1px solid ${ghost ? "transparent" : LINE}`,
        boxShadow: primary ? "0 6px 16px -6px rgba(15,37,89,.4)" : "none",
        ...style,
      }}
      {...p}
    >
      {children}
    </button>
  );
}
