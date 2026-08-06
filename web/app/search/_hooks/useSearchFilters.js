"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ARTISANS, TRADES } from "@/lib/data";

export function useSearchFilters() {
  const searchParams = useSearchParams();

  const [trade, setTrade] = useState(() => {
    const t = searchParams.get("trade");
    return t && TRADES.includes(t) ? t : "All";
  });
  const [query] = useState(() => searchParams.get("q") || "");
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

  return { trade, setTrade, maxKm, setMaxKm, minScore, setMinScore, results };
}
