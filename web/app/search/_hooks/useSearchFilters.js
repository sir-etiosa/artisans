"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export function useSearchFilters() {
  const searchParams = useSearchParams();

  const [trade, setTrade] = useState(() => searchParams.get("trade") || "All");
  const [query] = useState(() => searchParams.get("q") || "");
  const [maxKm, setMaxKm] = useState(5);
  const [minScore, setMinScore] = useState(80);
  const [artisans, setArtisans] = useState([]);
  const [availableTrades, setAvailableTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/artisans/categories")
      .then((res) => (res.ok ? res.json() : { categories: [] }))
      .then((data) => setAvailableTrades(data.categories.map((c) => c.trade)));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (trade !== "All") params.set("trade", trade);
    if (query) params.set("q", query);
    fetch(`/api/artisans?${params}`)
      .then((res) => (res.ok ? res.json() : { artisans: [] }))
      .then((data) => setArtisans(data.artisans))
      .finally(() => setLoading(false));
  }, [trade, query]);

  const changeTrade = (t) => {
    setLoading(true);
    setTrade(t);
  };

  const results = useMemo(
    () => artisans.filter((a) => a.km <= maxKm && a.score >= minScore),
    [artisans, maxKm, minScore]
  );

  return { trade, setTrade: changeTrade, maxKm, setMaxKm, minScore, setMinScore, results, availableTrades, loading };
}
