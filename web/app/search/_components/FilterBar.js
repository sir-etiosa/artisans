import { Chip } from "@/components/ui";
import { TRADES } from "@/lib/data";
import { FOREST, INK, MUTED } from "@/lib/theme";

export default function FilterBar({ trade, setTrade, maxKm, setMaxKm, minScore, setMinScore }) {
  return (
    <div className="card soft mt-5 p-4 flex flex-wrap gap-x-8 gap-y-4 items-center">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Trade">
        {TRADES.map((t) => (
          <Chip key={t} role="tab" aria-selected={trade === t} active={trade === t} onClick={() => setTrade(t)}>{t}</Chip>
        ))}
      </div>
      <label className="text-[13px] font-medium flex items-center gap-2" style={{ color: MUTED }}>
        Within <b style={{ color: INK }}>{maxKm} km</b>
        <input type="range" min="1" max="10" value={maxKm} onChange={(e) => setMaxKm(+e.target.value)} style={{ accentColor: FOREST }} />
      </label>
      <label className="text-[13px] font-medium flex items-center gap-2" style={{ color: MUTED }}>
        Trust Score ≥ <b style={{ color: INK }}>{minScore}</b>
        <input type="range" min="70" max="95" step="5" value={minScore} onChange={(e) => setMinScore(+e.target.value)} style={{ accentColor: FOREST }} />
      </label>
    </div>
  );
}
