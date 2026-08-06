import { CARD, LINE } from "@/lib/theme";

export default function PortfolioSection({ sel }) {
  return (
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
  );
}
