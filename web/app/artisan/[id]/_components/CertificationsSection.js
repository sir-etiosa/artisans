import { INK, MIST } from "@/lib/theme";

export default function CertificationsSection({ sel }) {
  return (
    <section className="card soft p-6">
      <h2 className="disp font-bold text-[17px]">Certifications</h2>
      <div className="flex flex-wrap gap-2 mt-3">
        {sel.certs.map((c) => (
          <span key={c} className="text-[13px] font-medium px-3 py-1.5 rounded-full"
            style={{ background: MIST, color: INK }}>✓ {c}</span>
        ))}
      </div>
    </section>
  );
}
