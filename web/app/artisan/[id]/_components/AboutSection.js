import { MUTED } from "@/lib/theme";

export default function AboutSection({ sel }) {
  return (
    <section className="card soft p-6">
      <h2 className="disp font-bold text-[17px]">About</h2>
      <p className="mt-2 leading-relaxed">{sel.bio}</p>
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-[13px]" style={{ color: MUTED }}>
        <span>{sel.years} years experience</span>
        <span>Responds in ~{sel.response}</span>
        <span>{sel.repeat} repeat clients</span>
      </div>
    </section>
  );
}
