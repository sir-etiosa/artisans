import { Logo, CredentialCard } from "@/components/ui";
import { ARTISANS } from "@/lib/data";
import { FOREST } from "@/lib/theme";

export default function BrandPanel() {
  return (
    <section className="hidden lg:flex flex-col justify-between p-12" style={{ background: FOREST, color: "#fff" }}>
      <div className="flex items-center gap-2.5">
        <Logo size={36} />
        <span className="disp font-bold text-xl">The Artisans</span>
      </div>
      <div className="max-w-md">
        <p className="eyebrow">Verified skill, on demand</p>
        <h1 className="disp font-bold mt-3 leading-[1.05]" style={{ fontSize: "2.9rem" }}>
          Every hand here has a name, an ID, and a track record.
        </h1>
        <p className="mt-4 text-lg" style={{ color: "#ffffffcc" }}>
          12,000+ electricians, tailors, developers, and photographers — government-ID verified, publicly rated, paid through escrow.
        </p>
        <div className="mt-8" style={{ maxWidth: 380 }}>
          <CredentialCard a={ARTISANS[0]} compact />
        </div>
      </div>
      <p className="text-[13px]" style={{ color: "#ffffff80" }}>Lagos · Abuja · Port Harcourt · Ibadan</p>
    </section>
  );
}
