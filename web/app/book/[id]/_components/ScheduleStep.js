import { Btn } from "@/components/ui";
import { MIST } from "@/lib/theme";

const TIMES = ["08:00", "10:00", "12:00", "14:00", "16:00"];

export default function ScheduleStep({ sel, job, setJob, onBack, onContinue }) {
  return (
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
            {TIMES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <p className="text-[13px] mt-4 px-3 py-2 rounded-lg inline-block" style={{ background: MIST }}>
        {sel.name.split(" ")[0]} usually responds in ~{sel.response}
      </p>
      <div className="flex justify-between mt-6">
        <Btn onClick={onBack}>Back</Btn>
        <Btn primary disabled={!job.date} style={{ opacity: job.date ? 1 : 0.45 }} onClick={onContinue}>Continue</Btn>
      </div>
    </div>
  );
}
