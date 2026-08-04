import { MUTED, INK, MIST, PINE, FOREST } from "@/lib/theme";

export default function Meter({ label, v }) {
  return (
    <div className="mt-3">
      <div className="flex justify-between text-[13px]" style={{ color: MUTED }}>
        <span>{label}</span><span className="font-semibold" style={{ color: INK }}>{v}</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full" style={{ background: MIST }}>
        <div className="h-full rounded-full" style={{ width: `${v}%`, background: `linear-gradient(90deg, ${PINE}, ${FOREST})` }} />
      </div>
    </div>
  );
}
