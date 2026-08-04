"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Btn, Score, Tick } from "@/components/ui";
import { getArtisan } from "@/lib/data";
import { FOREST, INK, LINE, MIST, MUTED, PAPER, PINE } from "@/lib/theme";

export default function BookPage() {
  const { id } = useParams();
  const router = useRouter();
  const sel = getArtisan(id);
  const [step, setStep] = useState(1);
  const [job, setJob] = useState({ desc: "", date: "", time: "10:00", addr: "" });

  if (!sel) {
    return (
      <main className="max-w-2xl mx-auto px-4 md:px-8 pt-16 text-center">
        <p style={{ color: MUTED }}>We couldn’t find that artisan.</p>
        <Btn className="mt-4" onClick={() => router.push("/search")}>Back to results</Btn>
      </main>
    );
  }

  const pay = () => {
    router.push(`/done/${sel.id}?date=${encodeURIComponent(job.date)}&time=${encodeURIComponent(job.time)}`);
  };

  return (
    <main className="max-w-2xl mx-auto px-4 md:px-8 pt-8">
      <button onClick={() => router.push(`/artisan/${sel.id}`)} className="text-sm font-semibold underline" style={{ color: PINE }}>← Back to profile</button>

      <div className="flex gap-2 mt-5" aria-label={`Booking step ${step} of 3`}>
        {["Job details", "Schedule", "Escrow & confirm"].map((s, i) => (
          <div key={s} className="flex-1">
            <div className="h-1.5 rounded-full" style={{ background: step > i ? FOREST : MIST }} />
            <p className="text-[12px] font-medium mt-1.5" style={{ color: step === i + 1 ? INK : MUTED }}>{s}</p>
          </div>
        ))}
      </div>

      <div className="card soft p-6 md:p-8 mt-5">
        <div className="flex items-center gap-3 pb-4 mb-5" style={{ borderBottom: `1px solid ${LINE}` }}>
          <div className="disp flex items-center justify-center font-bold"
            style={{ width: 42, height: 42, borderRadius: 10, background: sel.portfolio[0].c, border: `1px solid ${LINE}` }}>
            {sel.name.split(" ").map((w) => w[0]).join("")}
          </div>
          <div>
            <p className="font-semibold text-[15px]">{sel.name}<Tick /></p>
            <p className="text-[13px]" style={{ color: MUTED }}>{sel.trade} · <Score v={sel.score} small /></p>
          </div>
        </div>

        {step === 1 && (
          <div className="fade">
            <h1 className="disp font-bold text-2xl">What’s the job?</h1>
            <label className="label mt-5" htmlFor="desc">Describe it plainly</label>
            <textarea id="desc" rows={4} className="field" value={job.desc}
              onChange={(e) => setJob({ ...job, desc: e.target.value })}
              placeholder={sel.trade === "Tailor" ? "e.g. Agbada for a wedding on Aug 15 — I already have the fabric…" : "e.g. Two sockets sparking in the kitchen; DB board trips when the AC is on…"} />
            <label className="label mt-4" htmlFor="addr">Where?</label>
            <input id="addr" className="field" value={job.addr} onChange={(e) => setJob({ ...job, addr: e.target.value })} placeholder="12 Bode Thomas St, Surulere" />
            <div className="flex justify-end mt-6">
              <Btn primary disabled={!job.desc.trim()} style={{ opacity: job.desc.trim() ? 1 : 0.45 }} onClick={() => setStep(2)}>Continue</Btn>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade">
            <h1 className="disp font-bold text-2xl">When should {sel.name.split(" ")[0]} come?</h1>
            <div className="grid grid-cols-2 gap-4 mt-5">
              <div>
                <label className="label" htmlFor="date">Date</label>
                <input id="date" type="date" className="field" value={job.date} onChange={(e) => setJob({ ...job, date: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="time">Time</label>
                <select id="time" className="field" value={job.time} onChange={(e) => setJob({ ...job, time: e.target.value })}>
                  {["08:00", "10:00", "12:00", "14:00", "16:00"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <p className="text-[13px] mt-4 px-3 py-2 rounded-lg inline-block" style={{ background: MIST }}>
              {sel.name.split(" ")[0]} usually responds in ~{sel.response}
            </p>
            <div className="flex justify-between mt-6">
              <Btn onClick={() => setStep(1)}>Back</Btn>
              <Btn primary disabled={!job.date} style={{ opacity: job.date ? 1 : 0.45 }} onClick={() => setStep(3)}>Continue</Btn>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="fade">
            <h1 className="disp font-bold text-2xl">Payment goes to escrow first.</h1>
            <div className="mt-5 rounded-xl overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
              <div className="flex justify-between px-4 py-3 text-sm"><span style={{ color: MUTED }}>Base rate / call-out</span><span className="font-semibold">{sel.rate}</span></div>
              <div className="flex justify-between px-4 py-3 text-sm" style={{ borderTop: `1px solid ${LINE}` }}><span style={{ color: MUTED }}>Escrow protection</span><span className="font-semibold" style={{ color: PINE }}>Free</span></div>
              <div className="flex justify-between px-4 py-3 text-[15px] font-bold" style={{ borderTop: `1px solid ${LINE}`, background: PAPER }}>
                <span>Held until you confirm</span><span>{sel.rate.replace("From ", "")}</span>
              </div>
            </div>
            <ol className="mt-4 space-y-1.5 text-[13px] list-decimal list-inside" style={{ color: MUTED }}>
              <li>You pay now — we hold it, not the artisan.</li>
              <li>{sel.name.split(" ")[0]} does the job; you track progress in the app.</li>
              <li>You tap “Job done” — funds release. Dispute? We hold and mediate.</li>
            </ol>
            <div className="flex justify-between mt-6">
              <Btn onClick={() => setStep(2)}>Back</Btn>
              <Btn primary onClick={pay}>Pay {sel.rate.replace("From ", "")} to escrow</Btn>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
