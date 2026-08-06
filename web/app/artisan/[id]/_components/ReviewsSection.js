import { Stars } from "@/components/ui";
import { MUTED, PAPER } from "@/lib/theme";

export default function ReviewsSection({ sel }) {
  return (
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
  );
}
