import { BRASS, INK, LINE, MUTED, PAPER, PINE } from "@/lib/theme";

const ORDER = ["verifying", "minting", "ready"];

export default function ActivationSteps({ phase, chainLabel }) {
  const steps = [
    { k: "verifying", label: "Verifying your credentials" },
    { k: "minting", label: `Minting your wallet on ${chainLabel}` },
  ];

  return (
    <div className="mt-6 space-y-2.5 text-left">
      {steps.map((s, i) => {
        const done = ORDER.indexOf(phase) > i;
        const active = phase === s.k;
        return (
          <div key={s.k} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
            <span
              aria-hidden="true"
              className={active ? "spinner inline-block" : "inline-block"}
              style={{ width: 20, textAlign: "center", color: done ? PINE : active ? BRASS : MUTED }}
            >
              {done ? "✓" : active ? "◐" : "○"}
            </span>
            <span className="text-[13px] font-medium" style={{ color: done || active ? INK : MUTED }}>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}
