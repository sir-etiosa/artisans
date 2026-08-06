import { Btn } from "@/components/ui";

export default function JobDetailsStep({ sel, job, setJob, onContinue }) {
  return (
    <div className="fade">
      <h1 className="disp font-bold text-2xl">What’s the job?</h1>
      <label className="label mt-5" htmlFor="desc">Describe it plainly</label>
      <textarea id="desc" rows={4} className="field" value={job.desc}
        onChange={(e) => setJob({ ...job, desc: e.target.value })}
        placeholder={sel.trade === "Tailor" ? "e.g. Agbada for a wedding on Aug 15 — I already have the fabric…" : "e.g. Two sockets sparking in the kitchen; DB board trips when the AC is on…"} />
      <label className="label mt-4" htmlFor="addr">Where?</label>
      <input id="addr" className="field" value={job.addr} onChange={(e) => setJob({ ...job, addr: e.target.value })} placeholder="12 Bode Thomas St, Surulere" />
      <div className="flex justify-end mt-6">
        <Btn primary disabled={!job.desc.trim()} style={{ opacity: job.desc.trim() ? 1 : 0.45 }} onClick={onContinue}>Continue</Btn>
      </div>
    </div>
  );
}
