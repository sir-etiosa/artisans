import Seal from "./Seal";
import Tick from "./Tick";
import Score from "./Score";
import Stars from "./Stars";
import { FOREST, BRASS, LINE, MUTED } from "@/lib/theme";

/* the signature element: artisan profile rendered as a credential card */
export default function CredentialCard({ a, compact }) {
  return (
    <div className="card soft overflow-hidden" style={{ borderColor: `${BRASS}55` }}>
      <div className="px-5 pt-4 pb-3 flex items-center justify-between" style={{ background: FOREST }}>
        <div>
          <p className="text-[11px] font-semibold tracking-[.16em]" style={{ color: BRASS }}>THE ARTISANS · VERIFIED CREDENTIAL</p>
          <p className="text-[11px] mt-0.5" style={{ color: "#ffffff99" }}>№ TA-{String(a.id).padStart(5, "0")} · member since {a.since}</p>
        </div>
        <Seal size={compact ? 44 : 54} />
      </div>
      <div className="p-5 flex gap-4 items-start">
        <div
          className="disp shrink-0 flex items-center justify-center font-bold"
          style={{ width: 64, height: 64, borderRadius: 12, background: a.avatarColor, color: FOREST, fontSize: 22, border: `1px solid ${LINE}` }}
        >
          {a.name.split(" ").map((w) => w[0]).join("")}
        </div>
        <div className="min-w-0">
          <p className="disp font-bold text-xl leading-tight">{a.name}<Tick /></p>
          <p className="text-sm mt-0.5" style={{ color: MUTED }}>{a.level} {a.trade} · {a.area}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <Score v={a.score} small />
            <span className="text-sm" style={{ color: MUTED }}><Stars n={5} /> {a.rating} · {a.jobs} jobs</span>
          </div>
        </div>
      </div>
      {!compact && (
        <div className="px-5 pb-4 flex flex-wrap gap-x-5 gap-y-1 text-[13px]" style={{ color: MUTED }}>
          <span>Govt ID ✓</span><span>Selfie match ✓</span><span>NIN/BVN ✓</span><span>Phone & email ✓</span>
        </div>
      )}
    </div>
  );
}
