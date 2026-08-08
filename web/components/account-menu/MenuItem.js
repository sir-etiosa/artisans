import Link from "next/link";
import { INK, MIST, RED } from "@/lib/theme";

const rowStyle = {
  display: "block", width: "100%", textAlign: "left", padding: "9px 14px",
  fontSize: 13, fontWeight: 500, color: INK, borderRadius: 8, background: "none", border: "none",
};

export default function MenuItem({ href, onClick, danger, children }) {
  const hoverBg = (e) => (e.currentTarget.style.background = MIST);
  const clearBg = (e) => (e.currentTarget.style.background = "none");

  const style = danger ? { ...rowStyle, color: RED } : rowStyle;

  if (href) {
    return (
      <Link href={href} className="btn" role="menuitem" style={style} onClick={onClick} onMouseEnter={hoverBg} onMouseLeave={clearBg}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className="btn" role="menuitem" style={style} onClick={onClick} onMouseEnter={hoverBg} onMouseLeave={clearBg}>
      {children}
    </button>
  );
}
