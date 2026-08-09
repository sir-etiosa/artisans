"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { MIST, MUTED, PINE, FOREST, INK } from "@/lib/theme";
import { CategoryTileGrid, Pagination } from "@/components/ui";
import { useGoodsFilters } from "./_hooks/useGoodsFilters";
import GoodsCard from "./_components/GoodsCard";

function GoodsInner() {
  const router = useRouter();
  const {
    category, setCategory, maxKm, setMaxKm,
    results, availableCategories, loading, geoStatus, page, setPage, totalPages, total,
  } = useGoodsFilters();

  const totalListed = availableCategories.reduce((sum, c) => sum + c.count, 0);
  const tiles = [{ label: "All", count: totalListed }, ...availableCategories.map((c) => ({ label: c.category, count: c.count }))];

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
      <button onClick={() => router.push("/")} className="text-sm font-semibold underline" style={{ color: PINE }}>← Home</button>
      <div className="flex flex-wrap items-end justify-between gap-3 mt-3">
        <h1 className="disp font-bold" style={{ fontSize: "clamp(1.7rem,4vw,2.6rem)" }}>
          {category === "All" ? "All goods" : category}{" "}
          <span className="text-base font-normal" style={{ color: MUTED }}>
            {geoStatus === "granted" ? "near you" : "· enable location for distance"}
          </span>
        </h1>
        <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ background: MIST }}>{total} listing{total === 1 ? "" : "s"}</span>
      </div>

      <div className="card soft mt-5 p-4">
        <CategoryTileGrid categories={tiles} onSelect={setCategory} countLabel="listed" />
        <label className="text-[13px] font-medium flex items-center gap-2 mt-4" style={{ color: MUTED }}>
          Within <b style={{ color: INK }}>{maxKm} km</b>
          <input type="range" min="1" max="20" value={maxKm} onChange={(e) => setMaxKm(+e.target.value)} style={{ accentColor: FOREST }} />
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-5" aria-live="polite">
        {loading && <div className="card p-6 md:col-span-2 text-[15px]" style={{ color: MUTED }}>Loading…</div>}
        {!loading && results.length === 0 && (
          <div className="card p-6 md:col-span-2 text-[15px]" style={{ color: MUTED }}>
            No goods match those filters yet. Widen the distance or check back soon.
          </div>
        )}
        {!loading && results.map((g) => <GoodsCard key={g.id} g={g} />)}
      </div>

      {!loading && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
    </main>
  );
}

export default function GoodsPage() {
  return (
    <Suspense fallback={null}>
      <GoodsInner />
    </Suspense>
  );
}
