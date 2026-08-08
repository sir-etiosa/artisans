"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useGeolocation } from "@/lib/geo/useGeolocation";

export function useSearchFilters() {
  const searchParams = useSearchParams();
  const { coords, status: geoStatus } = useGeolocation();

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
    fetch(`/api/artisans?${params}`)
      .then((res) => (res.ok ? res.json() : { artisans: [] }))
      .then((data) => setArtisans(data.artisans))
      .finally(() => setLoading(false));
  }, [trade, query, geoStatus, coords]);

  const changeTrade = (t) => {
    setLoading(true);
    setTrade(t);
  };

  // Distance is unknown (not zero) for artisans who never granted location
  // when setting up their profile — don't filter those out just because we
  // can't compute a number, or a customer with location off would see nothing.
  const results = useMemo(
    () => artisans.filter((a) => (a.km == null || a.km <= maxKm) && a.score >= minScore),
    [artisans, maxKm, minScore]
  );

  return { trade, setTrade: changeTrade, maxKm, setMaxKm, minScore, setMinScore, results, availableTrades, loading, geoStatus };
}
