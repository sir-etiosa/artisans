"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { MIST, MUTED, PINE } from "@/lib/theme";
import { useSearchFilters } from "./_hooks/useSearchFilters";
import FilterBar from "./_components/FilterBar";
import ResultCard from "./_components/ResultCard";

function ResultsInner() {
  const router = useRouter();
  const { trade, setTrade, maxKm, setMaxKm, minScore, setMinScore, results } = useSearchFilters();

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
      <button onClick={() => router.push("/")} className="text-sm font-semibold underline" style={{ color: PINE }}>← Home</button>
      <div className="flex flex-wrap items-end justify-between gap-3 mt-3">
        <h1 className="disp font-bold" style={{ fontSize: "clamp(1.7rem,4vw,2.6rem)" }}>
          {trade === "All" ? "All artisans" : `${trade}s`} <span className="text-base font-normal" style={{ color: MUTED }}>near Surulere</span>
        </h1>
        <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ background: MIST }}>{results.length} match{results.length === 1 ? "" : "es"}</span>
      </div>

      <FilterBar trade={trade} setTrade={setTrade} maxKm={maxKm} setMaxKm={setMaxKm} minScore={minScore} setMinScore={setMinScore} />

      <div className="grid md:grid-cols-2 gap-4 mt-5" aria-live="polite">
        {results.length === 0 && (
          <div className="card p-6 md:col-span-2 text-[15px]" style={{ color: MUTED }}>
            No one matches those filters yet. Widen the distance or lower the Trust Score bar — new artisans verify daily.
          </div>
        )}
        {results.map((a) => <ResultCard key={a.id} a={a} />)}
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
