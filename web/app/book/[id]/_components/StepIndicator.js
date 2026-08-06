import { FOREST, INK, MIST, MUTED } from "@/lib/theme";

const STEPS = ["Job details", "Schedule", "Escrow & confirm"];

export default function StepIndicator({ step }) {
  return (
    <div className="flex gap-2 mt-5" aria-label={`Booking step ${step} of 3`}>
      {STEPS.map((s, i) => (
        <div key={s} className="flex-1">
          <div className="h-1.5 rounded-full" style={{ background: step > i ? FOREST : MIST }} />
          <p className="text-[12px] font-medium mt-1.5" style={{ color: step === i + 1 ? INK : MUTED }}>{s}</p>
        </div>
      ))}
    </div>
  );
}
