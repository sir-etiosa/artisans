"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Btn, Chip, Score, Stars, Tick } from "@/components/ui";
import { ARTISANS, TRADES } from "@/lib/data";
import { FOREST, INK, MIST, LINE, MUTED, PINE } from "@/lib/theme";

function ResultsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [trade, setTrade] = useState(() => {
    const t = searchParams.get("trade");
    return t && TRADES.includes(t) ? t : "All";
  });
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [maxKm, setMaxKm] = useState(5);
  const [minScore, setMinScore] = useState(80);

  const results = useMemo(
    () =>
      ARTISANS.filter(
        (a) =>
          (trade === "All" || a.trade === trade) &&
          (query.trim() === "" || (a.trade + " " + a.name + " " + a.tag).toLowerCase().includes(query.trim().toLowerCase())) &&
          a.km <= maxKm &&
          a.score >= minScore
      ),
    [trade, query, maxKm, minScore]
  );

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
      <button onClick={() => router.push("/")} className="text-sm font-semibold underline" style={{ color: PINE }}>← Home</button>
      <div className="flex flex-wrap items-end justify-between gap-3 mt-3">
        <h1 className="disp font-bold" style={{ fontSize: "clamp(1.7rem,4vw,2.6rem)" }}>
          {trade === "All" ? "All artisans" : `${trade}s`} <span className="text-base font-normal" style={{ color: MUTED }}>near Surulere</span>
        </h1>
        <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ background: MIST }}>{results.length} match{results.length === 1 ? "" : "es"}</span>
      </div>

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

      <div className="grid md:grid-cols-2 gap-4 mt-5" aria-live="polite">
        {results.length === 0 && (
          <div className="card p-6 md:col-span-2 text-[15px]" style={{ color: MUTED }}>
            No one matches those filters yet. Widen the distance or lower the Trust Score bar — new artisans verify daily.
          </div>
        )}
        {results.map((a) => (
          <article key={a.id} className="hoverable card soft p-5">
            <div className="flex justify-between items-start gap-3">
              <div className="flex gap-3.5 min-w-0">
                <div className="disp shrink-0 flex items-center justify-center font-bold"
                  style={{ width: 56, height: 56, borderRadius: 12, background: a.portfolio[0].c, fontSize: 18, border: `1px solid ${LINE}` }}>
                  {a.name.split(" ").map((w) => w[0]).join("")}
                </div>
                <div className="min-w-0">
                  <p className="disp font-bold text-lg leading-tight truncate">{a.name}<Tick /></p>
                  <p className="text-[13px] mt-0.5" style={{ color: MUTED }}>{a.level} · {a.km} km · {a.area}</p>
                  <p className="text-[13px] mt-1.5" style={{ color: MUTED }}>
                    <Stars n={5} /> {a.rating} · {a.jobs} jobs · responds in {a.response}
                  </p>
                </div>
              </div>
              <Score v={a.score} small />
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 flex-wrap gap-3" style={{ borderTop: `1px solid ${LINE}` }}>
              <span className="text-sm font-semibold">{a.rate} <span className="font-normal" style={{ color: MUTED }}>· {a.tag}</span></span>
              <div className="flex gap-2">
                <Btn small onClick={() => router.push(`/artisan/${a.id}`)}>Profile</Btn>
                <Btn small primary onClick={() => router.push(`/book/${a.id}`)}>Book</Btn>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <ResultsInner />
    </Suspense>
  );
}
