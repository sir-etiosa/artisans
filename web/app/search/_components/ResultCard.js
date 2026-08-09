import { useRouter } from "next/navigation";
import { Btn, Score, Stars, Tick } from "@/components/ui";
import { LINE, MUTED } from "@/lib/theme";

export default function ResultCard({ a }) {
  const router = useRouter();

  return (
    <article className="hoverable card soft p-5">
      <div className="flex justify-between items-start gap-3">
        <div className="flex gap-3.5 min-w-0">
          <div className="disp shrink-0 flex items-center justify-center font-bold"
            style={{ width: 56, height: 56, borderRadius: 12, background: a.avatarColor, color: "#fff", fontSize: 18, border: `1px solid ${LINE}` }}>
            {a.name.split(" ").map((w) => w[0]).join("")}
          </div>
          <div className="min-w-0">
            <p className="disp font-bold text-lg leading-tight truncate">{a.name}<Tick /></p>
            <p className="text-[13px] mt-0.5" style={{ color: MUTED }}>{a.level} · {a.km} km · {a.area}</p>
            <p className="text-[13px] mt-1.5" style={{ color: MUTED }}>
              <Stars n={5} /> {a.rating} · {a.jobs} jobs · responds in {a.response}
            </p>
          </div>
        </div>
        <Score v={a.score} small />
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 flex-wrap gap-3" style={{ borderTop: `1px solid ${LINE}` }}>
        <span className="text-sm font-semibold">{a.rate} <span className="font-normal" style={{ color: MUTED }}>· {a.tag}</span></span>
        <div className="flex gap-2">
          <Btn small onClick={() => router.push(`/artisan/${a.id}`)}>Profile</Btn>
          <Btn small primary onClick={() => router.push(`/book/${a.id}`)}>Book</Btn>
        </div>
      </div>
    </article>
  );
}
