import { Logo, CredentialCard } from "@/components/ui";
import { FOREST } from "@/lib/theme";

// Illustrative only — shown to logged-out visitors, not backed by a real account.
const DEMO_CREDENTIAL = {
  id: "demo", name: "Chinedu Okafor", level: "Professional", trade: "Electrician",
  area: "Surulere, Lagos", score: 96, rating: 4.9, jobs: 214, since: "2019",
  avatarColor: "#E8DFC9",
};

export default function BrandPanel() {
  return (
    <section className="hidden lg:flex flex-col justify-between p-12" style={{ background: FOREST, color: "#fff" }}>
      <div className="flex items-center gap-2.5">
        <Logo size={36} />
        <span className="disp font-bold text-xl">The Artisans</span>
      </div>
      <div className="max-w-md">
        <p className="eyebrow">Verified skill, on demand</p>
        <div className="mt-8" style={{ maxWidth: 380 }}>
          <CredentialCard a={DEMO_CREDENTIAL} compact />
        </div>
      </div>
      <p className="text-[13px]" style={{ color: "#ffffff80" }}>Lagos · Abuja · Port Harcourt · Ibadan</p>
    </section>
  );
}
