import { useRouter } from "next/navigation";
import { Btn, CredentialCard, Meter } from "@/components/ui";
import { MUTED } from "@/lib/theme";

export default function ProfileSidebar({ sel }) {
  const router = useRouter();

  return (
    <div className="lg:sticky lg:top-24 space-y-5">
      <CredentialCard a={sel} />
      <div className="card soft p-5">
        <p className="text-sm font-semibold">{sel.rate}</p>
        <Btn primary className="w-full mt-3" onClick={() => router.push(`/book/${sel.id}`)}>
          Book {sel.name.split(" ")[0]}
        </Btn>
        <Btn className="w-full mt-2" small>Message first</Btn>
        <p className="text-[12px] mt-3 text-center" style={{ color: MUTED }}>Payment held in escrow · released when you confirm</p>
      </div>
      <div className="card soft p-5">
        <h2 className="disp font-bold text-[17px]">Trust Score · {sel.score}</h2>
        <Meter label="Job completion" v={sel.breakdown.completion} />
        <Meter label="Customer ratings" v={sel.breakdown.ratings} />
        <Meter label="Response time" v={sel.breakdown.response} />
        <Meter label="Repeat clients" v={sel.breakdown.repeat} />
        <p className="text-[12px] mt-4" style={{ color: MUTED }}>Recalculated after every completed job. This number can’t be bought.</p>
      </div>
    </div>
  );
}
