import { Score, Tick } from "@/components/ui";
import { LINE, MUTED } from "@/lib/theme";

export default function ArtisanHeader({ sel }) {
  return (
    <div className="flex items-center gap-3 pb-4 mb-5" style={{ borderBottom: `1px solid ${LINE}` }}>
      <div className="disp flex items-center justify-center font-bold"
        style={{ width: 42, height: 42, borderRadius: 10, background: sel.portfolio[0].c, border: `1px solid ${LINE}` }}>
        {sel.name.split(" ").map((w) => w[0]).join("")}
      </div>
      <div>
        <p className="font-semibold text-[15px]">{sel.name}<Tick /></p>
        <p className="text-[13px]" style={{ color: MUTED }}>{sel.trade} · <Score v={sel.score} small /></p>
      </div>
    </div>
  );
}
