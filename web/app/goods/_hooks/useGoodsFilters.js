"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useGeolocation } from "@/lib/geo/useGeolocation";

export function useGoodsFilters() {
  const searchParams = useSearchParams();
  const { coords, status: geoStatus } = useGeolocation();

  const [category, setCategoryState] = useState(() => searchParams.get("category") || "All");
  const [query] = useState(() => searchParams.get("q") || "");
  const [maxKm, setMaxKmState] = useState(10);
  const [page, setPage] = useState(1);
  const [goods, setGoods] = useState([]);
  const [pageInfo, setPageInfo] = useState({ total: 0, totalPages: 1 });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/goods/categories")
      .then((res) => (res.ok ? res.json() : { categories: [] }))
      .then((data) => setAvailableCategories(data.categories));
  }, []);

  useEffect(() => {
    if (geoStatus === "idle" || geoStatus === "loading") return;

    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    if (query) params.set("q", query);
    if (coords) {
      params.set("lat", coords.lat);
      params.set("lng", coords.lng);
    }
    params.set("maxKm", maxKm);
    params.set("page", page);
    Promise.resolve().then(() => setLoading(true));
    fetch(`/api/goods?${params}`)
      .then((res) => (res.ok ? res.json() : { goods: [], total: 0, totalPages: 1 }))
      .then((data) => {
        setGoods(data.goods);
        setPageInfo({ total: data.total, totalPages: data.totalPages });
      })
      .finally(() => setLoading(false));
  }, [category, query, geoStatus, coords, maxKm, page]);

  const setCategory = (c) => { setPage(1); setCategoryState(c); };
  const setMaxKm = (v) => { setPage(1); setMaxKmState(v); };

  return {
    category, setCategory, maxKm, setMaxKm,
    results: goods, availableCategories, loading, geoStatus,
    page, setPage, totalPages: pageInfo.totalPages, total: pageInfo.total,
  };
}
