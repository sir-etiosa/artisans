"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Tick, CredentialCard } from "@/components/ui";
import { FOREST, MUTED, BRASS, BRASS_SOFT } from "@/lib/theme";
import { timeOfDayGreeting } from "@/lib/greeting";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { user } = useCurrentUser();
  const [categories, setCategories] = useState([]);
  const [topArtisans, setTopArtisans] = useState([]);
  const [totalVerified, setTotalVerified] = useState(0);

  useEffect(() => {
    fetch("/api/artisans/categories")
      .then((res) => (res.ok ? res.json() : { categories: [] }))
      .then((data) => {
        setCategories(data.categories);
        setTotalVerified(data.categories.reduce((sum, c) => sum + c.count, 0));
      });
    fetch("/api/artisans")
      .then((res) => (res.ok ? res.json() : { artisans: [] }))
      .then((data) => setTopArtisans(data.artisans.slice(0, 3)));
  }, []);

  const searchByTrade = (trade) => router.push(`/search?trade=${encodeURIComponent(trade)}`);
  const searchByText = (q) => router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search?trade=All");

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8">
      <section className="pt-12 pb-10 fade">
        <p className="eyebrow">{timeOfDayGreeting()}{user ? `, ${user.fullName.split(" ")[0]}` : ""}</p>
        <h1 className="disp font-bold mt-2 leading-[1.05]" style={{ fontSize: "clamp(2rem,5vw,3.4rem)" }}>
          Who do you need today?
        </h1>
        <form
          className="card soft mt-6 flex flex-col sm:flex-row overflow-hidden rounded-3xl sm:rounded-full"
          style={{ maxWidth: 720 }}
          onSubmit={(e) => { e.preventDefault(); searchByText(query); }}
        >
          <label htmlFor="q" className="sr-only">Search for an artisan</label>
          <input id="q" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Try “plumber”, “music producer”, “wedding photographer”…"
            className="flex-1 px-6 py-4 text-[15px] bg-transparent outline-none" />
          <button type="submit" className="btn font-semibold px-8 py-4 m-1.5 rounded-full"
            style={{ background: FOREST, color: "#fff" }}>
            Search
          </button>
        </form>
        <p className="text-[13px] mt-3" style={{ color: MUTED }}>
          ⌖ Search shows real distance to verified artisans near you
        </p>
      </section>

      <section className="pb-10">
        <div className="flex items-baseline justify-between">
          <h2 className="disp font-bold text-xl">Popular near you</h2>
          <span className="text-[13px]" style={{ color: MUTED }}>{totalVerified} verified</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {categories.map((c) => (
            <button key={c.trade} onClick={() => searchByTrade(c.trade)}
              className="hoverable card p-4 text-left">
              <p className="font-semibold text-[15px]">{c.trade}</p>
              <p className="text-[13px] mt-1" style={{ color: MUTED }}>{c.count} verified<Tick /></p>
            </button>
          ))}
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

      <section className="card soft p-6 md:p-8 flex flex-wrap gap-6 items-center justify-between" style={{ background: FOREST, borderColor: FOREST }}>
        <div className="max-w-xl">
          <h2 className="disp font-bold text-2xl" style={{ color: "#fff" }}>Money sits in escrow until you say “done.”</h2>
          <p className="mt-2" style={{ color: "#ffffffcc" }}>You pay when booking; we hold it. The artisan gets paid the moment you confirm the job — and if something goes wrong, we mediate before a naira moves.</p>
        </div>
        <Btn onClick={() => searchByTrade("All")} style={{ background: BRASS_SOFT, color: FOREST, borderColor: BRASS }}>Browse all artisans</Btn>
      </section>
    </main>
  );
}
