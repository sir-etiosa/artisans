import Link from "next/link";
import { Btn } from "@/components/ui";
import { MUTED } from "@/lib/theme";

export default function BalanceCard({ user }) {
  const verified = user.verificationStatus === "verified";

  return (
    <section className="card soft p-6">
      <h2 className="disp font-bold text-[17px]">ART balance</h2>
      <p className="text-[13px] mt-1" style={{ color: MUTED }}>
        {verified ? "Deposit NGN to top up your ART balance." : "Verify your identity to deposit or withdraw."}
      </p>
      <div className="flex gap-2 mt-4">
        <Link href={verified ? "/deposit" : "#"} aria-disabled={!verified} style={{ pointerEvents: verified ? "auto" : "none" }}>
          <Btn primary small style={{ opacity: verified ? 1 : 0.4 }}>Deposit</Btn>
        </Link>
        <Link href={verified ? "/withdraw" : "#"} aria-disabled={!verified} style={{ pointerEvents: verified ? "auto" : "none" }}>
          <Btn small style={{ opacity: verified ? 1 : 0.4 }}>Withdraw</Btn>
        </Link>
      </div>
    </section>
  );
}
