"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useGeolocation } from "@/lib/geo/useGeolocation";

export function useSearchFilters() {
  const searchParams = useSearchParams();
  const { coords, status: geoStatus } = useGeolocation();

  const [trade, setTrade] = useState(() => searchParams.get("trade") || "All");
  const [query] = useState(() => searchParams.get("q") || "");
  const [maxKm, setMaxKm] = useState(5);
  const [minScore, setMinScore] = useState(80);
  const [page, setPage] = useState(1);
  const [artisans, setArtisans] = useState([]);
  const [pageInfo, setPageInfo] = useState({ total: 0, totalPages: 1 });
  const [availableTrades, setAvailableTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/artisans/categories")
      .then((res) => (res.ok ? res.json() : { categories: [] }))
      .then((data) => setAvailableTrades(data.categories.map((c) => c.trade)));
  }, []);

  useEffect(() => {
    // Wait for geolocation to settle (granted, denied, or unsupported)
    // before fetching, so the first fetch already carries real coordinates
    // when they're available instead of a distance-less refetch right after.
    if (geoStatus === "idle" || geoStatus === "loading") return;

    const params = new URLSearchParams();
    if (trade !== "All") params.set("trade", trade);
    if (query) params.set("q", query);
    if (coords) {
      params.set("lat", coords.lat);
      params.set("lng", coords.lng);
    }
    params.set("maxKm", maxKm);
    params.set("minScore", minScore);
    params.set("page", page);
    fetch(`/api/artisans?${params}`)
      .then((res) => (res.ok ? res.json() : { artisans: [], total: 0, totalPages: 1 }))
      .then((data) => {
        setArtisans(data.artisans);
        setPageInfo({ total: data.total, totalPages: data.totalPages });
      })
      .finally(() => setLoading(false));
  }, [trade, query, geoStatus, coords, maxKm, minScore, page]);

  const changeTrade = (t) => {
    setLoading(true);
    setPage(1);
    setTrade(t);
  };

  const changeMaxKm = (v) => { setPage(1); setMaxKm(v); };
  const changeMinScore = (v) => { setPage(1); setMinScore(v); };

  return {
    trade, setTrade: changeTrade,
    maxKm, setMaxKm: changeMaxKm,
    minScore, setMinScore: changeMinScore,
    results: artisans, availableTrades, loading, geoStatus,
    page, setPage, totalPages: pageInfo.totalPages, total: pageInfo.total,
  };
}
