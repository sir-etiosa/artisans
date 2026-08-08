"use client";

import { Btn, Tick } from "@/components/ui";
import { BRASS, BRASS_SOFT, CARD, FOREST, INK, LINE, MUTED, PAPER, PINE } from "@/lib/theme";
import { timeOfDayGreeting } from "@/lib/greeting";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";

const STATS = [
  { l: "Trust Score", v: "93", sub: "▲ 2 this month", dark: true },
  { l: "Earned this month", v: "₦482k", sub: "31 jobs completed" },
  { l: "Rating", v: "4.8", sub: "212 reviews" },
  { l: "Response time", v: "9 min", sub: "top 10% in Lagos" },
];

const REQUESTS = [
  { n: "Richard A.", job: "Fix kitchen cabinet hinges + new shelf", when: "Tomorrow · 10:00", pay: "₦18,000", isNew: true },
  { n: "Ada N.", job: "Build 4 display stands for an event", when: "Aug 2 · 08:00", pay: "₦95,000", isNew: true },
  { n: "Mrs. Balogun", job: "Wardrobe repair", when: "Jul 28 · 12:00", pay: "₦22,000", isNew: false },
];

const GROWTH_TIPS = [
  "+2 pts — upload your Trade Test Grade 1 certificate",
  "+1 pt — keep response time under 10 min this week",
  "+3 pts — 5 more completed jobs to reach Top Pro tier",
];

export default function DashboardPage() {
  const { user } = useCurrentUser();

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Artisan dashboard</p>
          <h1 className="disp font-bold mt-1" style={{ fontSize: "clamp(1.7rem,4vw,2.6rem)" }}>
            {timeOfDayGreeting()}{user ? `, ${user.fullName.split(" ")[0]}` : ""}{" "}
            <span className="text-base font-normal" style={{ color: MUTED }}>
              · Artisan{user?.emailVerified && <> · Verified<Tick /></>}
            </span>
          </h1>
        </div>
        <span className="text-[13px] font-semibold px-3 py-1.5 rounded-full" style={{ background: BRASS_SOFT, color: FOREST, border: `1px solid ${BRASS}66` }}>
          2 new requests
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {STATS.map((s) => (
          <div key={s.l} className="card soft p-4" style={s.dark ? { background: FOREST, borderColor: FOREST } : {}}>
            <p className="text-[12px] font-medium" style={{ color: s.dark ? "#ffffff99" : MUTED }}>{s.l}</p>
            <p className="disp font-bold mt-1" style={{ fontSize: "1.9rem", color: s.dark ? BRASS_SOFT : INK }}>{s.v}</p>
            <p className="text-[12px] mt-0.5" style={{ color: s.dark ? "#ffffff99" : MUTED }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-6 items-start">
        <section className="lg:col-span-2 card soft p-6">
          <h2 className="disp font-bold text-[17px]">Booking requests</h2>
          {REQUESTS.map((r) => (
            <div key={r.n + r.when} className="mt-4 p-4 rounded-xl flex flex-wrap gap-3 justify-between items-center"
              style={{ background: r.isNew ? PAPER : CARD, border: `1px solid ${LINE}` }}>
              <div>
                <p className="font-semibold text-[15px]">
                  {r.n} {r.isNew && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full align-middle" style={{ background: BRASS_SOFT, color: FOREST, border: `1px solid ${BRASS}66` }}>NEW</span>}
                </p>
                <p className="text-[13px] mt-0.5" style={{ color: MUTED }}>{r.job}</p>
                <p className="text-[13px] mt-0.5" style={{ color: MUTED }}>{r.when} · <b style={{ color: INK }}>{r.pay}</b> · <span style={{ color: PINE }}>in escrow ✓</span></p>
              </div>
              <div className="flex gap-2">
                <Btn small primary>Accept</Btn>
                <Btn small>Chat</Btn>
              </div>
            </div>
          ))}
        </section>

        <section className="card soft p-6" style={{ background: FOREST, borderColor: FOREST }}>
          <h2 className="disp font-bold text-[17px]" style={{ color: BRASS_SOFT }}>Grow your Trust Score</h2>
          <ul className="mt-4 space-y-2.5 text-[13px]">
            {GROWTH_TIPS.map((t) => (
              <li key={t} className="p-3 rounded-lg" style={{ background: "#ffffff14", color: "#fff" }}>{t}</li>
            ))}
          </ul>
          <p className="text-[12px] mt-4" style={{ color: "#ffffff99" }}>Score 95+ unlocks featured placement in search.</p>
          <Btn small className="mt-4" style={{ background: BRASS_SOFT, color: FOREST, borderColor: BRASS }}>Upload certificate</Btn>
        </section>
      </div>
    </main>
  );
}
