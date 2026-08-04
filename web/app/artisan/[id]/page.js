"use client";

import { useParams, useRouter } from "next/navigation";
import { Btn, CredentialCard, Meter, Stars } from "@/components/ui";
import { getArtisan } from "@/lib/data";
import { CARD, INK, LINE, MIST, MUTED, PAPER, PINE } from "@/lib/theme";

export default function ArtisanProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const sel = getArtisan(id);

  if (!sel) {
    return (
      <main className="max-w-3xl mx-auto px-4 md:px-8 pt-16 text-center">
        <p style={{ color: MUTED }}>We couldn’t find that artisan.</p>
        <Btn className="mt-4" onClick={() => router.push("/search")}>Back to results</Btn>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
      <button onClick={() => router.push("/search")} className="text-sm font-semibold underline" style={{ color: PINE }}>← Back to results</button>

      <div className="grid lg:grid-cols-3 gap-6 mt-4 items-start">
        <div className="lg:sticky lg:top-24 space-y-5">
          <CredentialCard a={sel} />
          <div className="card soft p-5">
            <p className="text-sm font-semibold">{sel.rate}</p>
            <Btn primary className="w-full mt-3" onClick={() => router.push(`/book/${sel.id}`)}>
              Book {sel.name.split(" ")[0]}
            </Btn>
            <Btn className="w-full mt-2" small>Message first</Btn>
            <p className="text-[12px] mt-3 text-center" style={{ color: MUTED }}>Payment held in escrow · released when you confirm</p>
          </div>
          <div className="card soft p-5">
            <h2 className="disp font-bold text-[17px]">Trust Score · {sel.score}</h2>
            <Meter label="Job completion" v={sel.breakdown.completion} />
            <Meter label="Customer ratings" v={sel.breakdown.ratings} />
            <Meter label="Response time" v={sel.breakdown.response} />
            <Meter label="Repeat clients" v={sel.breakdown.repeat} />
            <p className="text-[12px] mt-4" style={{ color: MUTED }}>Recalculated after every completed job. This number can’t be bought.</p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <section className="card soft p-6">
            <h2 className="disp font-bold text-[17px]">About</h2>
            <p className="mt-2 leading-relaxed">{sel.bio}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-[13px]" style={{ color: MUTED }}>
              <span>{sel.years} years experience</span>
              <span>Responds in ~{sel.response}</span>
              <span>{sel.repeat} repeat clients</span>
            </div>
          </section>

          <section className="card soft p-6">
            <h2 className="disp font-bold text-[17px]">Certifications</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              {sel.certs.map((c) => (
                <span key={c} className="text-[13px] font-medium px-3 py-1.5 rounded-full"
                  style={{ background: MIST, color: INK }}>✓ {c}</span>
              ))}
            </div>
          </section>

          <section className="card soft p-6">
            <h2 className="disp font-bold text-[17px]">Portfolio</h2>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {sel.portfolio.map((p) => (
                <figure key={p.l} className="hoverable rounded-xl overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
                  <div className="h-28" style={{ background: `linear-gradient(135deg, ${p.c}, ${p.c}cc)` }} aria-hidden="true" />
                  <figcaption className="text-[13px] font-medium p-2.5" style={{ background: CARD }}>{p.l}</figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section className="card soft p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="disp font-bold text-[17px]">Reviews</h2>
              <span className="text-[12px]" style={{ color: MUTED }}>from verified bookings only</span>
            </div>
            <div className="space-y-3 mt-4">
              {sel.reviews.map((r) => (
                <div key={r.n + r.d} className="p-4 rounded-xl" style={{ background: PAPER }}>
                  <div className="flex justify-between flex-wrap gap-2 text-sm">
                    <span className="font-semibold">{r.n}</span>
                    <span style={{ color: MUTED }}>{r.d} · <Stars n={r.s} /></span>
                  </div>
                  <p className="mt-1.5 text-[15px] leading-relaxed">{r.t}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
