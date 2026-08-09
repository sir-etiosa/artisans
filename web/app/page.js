"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Chip, Tick, CredentialCard, CategoryTileGrid } from "@/components/ui";
import { FOREST, MUTED, BRASS, BRASS_SOFT } from "@/lib/theme";
import { timeOfDayGreeting } from "@/lib/greeting";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import GoodsCard from "./goods/_components/GoodsCard";

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("services"); // "services" | "goods"
  const { user } = useCurrentUser();
  const [categories, setCategories] = useState([]);
  const [topArtisans, setTopArtisans] = useState([]);
  const [goodsCategories, setGoodsCategories] = useState([]);
  const [newestGoods, setNewestGoods] = useState([]);

  useEffect(() => {
    fetch("/api/artisans/categories")
      .then((res) => (res.ok ? res.json() : { categories: [] }))
      .then((data) => setCategories(data.categories));
    fetch("/api/artisans")
      .then((res) => (res.ok ? res.json() : { artisans: [] }))
      .then((data) => setTopArtisans(data.artisans.slice(0, 3)));
    fetch("/api/goods/categories")
      .then((res) => (res.ok ? res.json() : { categories: [] }))
      .then((data) => setGoodsCategories(data.categories));
    fetch("/api/goods?pageSize=3")
      .then((res) => (res.ok ? res.json() : { goods: [] }))
      .then((data) => setNewestGoods(data.goods));
  }, []);

  const totalVerified = categories.reduce((sum, c) => sum + c.count, 0);
  const totalGoods = goodsCategories.reduce((sum, c) => sum + c.count, 0);

  const searchByTrade = (trade) => router.push(`/search?trade=${encodeURIComponent(trade)}`);
  const searchByCategory = (category) => router.push(`/goods?category=${encodeURIComponent(category)}`);
  const searchByText = (q) => {
    if (mode === "goods") {
      router.push(q.trim() ? `/goods?q=${encodeURIComponent(q.trim())}` : "/goods");
    } else {
      router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search?trade=All");
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8">
      <section className="pt-12 pb-10 fade">
        <p className="eyebrow">{timeOfDayGreeting()}{user ? `, ${user.fullName.split(" ")[0]}` : ""}</p>
        <h1 className="disp font-bold mt-2 leading-[1.05]" style={{ fontSize: "clamp(2rem,5vw,3.4rem)" }}>
          Who do you need today?
        </h1>

        <div className="flex gap-2 mt-6">
          <Chip active={mode === "services"} onClick={() => setMode("services")}>Services</Chip>
          <Chip active={mode === "goods"} onClick={() => setMode("goods")}>Goods</Chip>
        </div>

        <form
          className="card soft mt-4 flex flex-col sm:flex-row overflow-hidden rounded-3xl sm:rounded-full"
          style={{ maxWidth: 720 }}
          onSubmit={(e) => { e.preventDefault(); searchByText(query); }}
        >
          <label htmlFor="q" className="sr-only">{mode === "goods" ? "Search for goods" : "Search for an artisan"}</label>
          <input id="q" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === "goods" ? "Try “angle grinder”, “generator”, “tiles”…" : "Try “plumber”, “music producer”, “wedding photographer”…"}
            className="flex-1 px-6 py-4 text-[15px] bg-transparent outline-none" />
          <button type="submit" className="btn font-semibold px-8 py-4 m-1.5 rounded-full"
            style={{ background: FOREST, color: "#fff" }}>
            Search
          </button>
        </form>
        <p className="text-[13px] mt-3" style={{ color: MUTED }}>
          ⌖ {mode === "goods" ? "Browse shows real distance to sellers near you" : "Search shows real distance to verified artisans near you"}
        </p>
      </section>

      {mode === "services" ? (
        <>
          <section className="pb-10">
            <div className="flex items-baseline justify-between">
              <h2 className="disp font-bold text-xl">Popular near you</h2>
              <span className="text-[13px]" style={{ color: MUTED }}>{totalVerified} verified</span>
            </div>
            <div className="mt-4">
              <CategoryTileGrid categories={categories.map((c) => ({ label: c.trade, count: c.count }))} onSelect={searchByTrade} countLabel="verified" />
            </div>
          </section>

          <section className="pb-12">
            <h2 className="disp font-bold text-xl">Top Trust Scores this week</h2>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              {topArtisans.map((a) => (
                <button key={a.id} onClick={() => router.push(`/artisan/${a.id}`)} className="hoverable text-left">
                  <CredentialCard a={a} compact />
                </button>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="pb-10">
            <div className="flex items-baseline justify-between">
              <h2 className="disp font-bold text-xl">Popular goods near you</h2>
              <span className="text-[13px]" style={{ color: MUTED }}>{totalGoods} listed</span>
            </div>
            <div className="mt-4">
              <CategoryTileGrid categories={goodsCategories.map((c) => ({ label: c.category, count: c.count }))} onSelect={searchByCategory} countLabel="listed" />
            </div>
          </section>

          <section className="pb-12">
            <h2 className="disp font-bold text-xl">Newest goods</h2>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              {newestGoods.map((g) => <GoodsCard key={g.id} g={g} />)}
              {newestGoods.length === 0 && <p className="text-[14px]" style={{ color: MUTED }}>No goods posted yet.</p>}
            </div>
          </section>
        </>
      )}

      <section className="card soft p-6 md:p-8 flex flex-wrap gap-6 items-center justify-between" style={{ background: FOREST, borderColor: FOREST }}>
        <div className="max-w-xl">
          <h2 className="disp font-bold text-2xl" style={{ color: "#fff" }}>Money sits in escrow until you say “done.”</h2>
          <p className="mt-2" style={{ color: "#ffffffcc" }}>You pay when booking; we hold it. The artisan gets paid the moment you confirm the job — and if something goes wrong, we mediate before a naira moves.</p>
        </div>
        <Btn onClick={() => (mode === "goods" ? router.push("/goods") : searchByTrade("All"))} style={{ background: BRASS_SOFT, color: FOREST, borderColor: BRASS }}>
          {mode === "goods" ? "Browse all goods" : "Browse all artisans"}
        </Btn>
      </section>
    </main>
  );
}
