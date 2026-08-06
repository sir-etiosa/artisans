"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Seal, Btn } from "@/components/ui";
import { CHAINS } from "@/lib/data";
import { MUTED } from "@/lib/theme";
import { useActivation } from "./_hooks/useActivation";
import NetworkPicker from "./_components/NetworkPicker";
import ActivationSteps from "./_components/ActivationSteps";
import WalletSummary from "./_components/WalletSummary";

function ActivateInner() {
  const router = useRouter();
  const { walletChain, setWalletChain, phase, walletAddress, role } = useActivation();
  const chain = CHAINS.find((c) => c.id === walletChain);

  return (
    <main className="max-w-lg mx-auto px-4 md:px-8 pt-16">
      <div className="card soft p-8 text-center fade">
        <div className="flex justify-center">
          <div className={phase !== "ready" ? "spinner" : ""}>
            <Seal
              size={72}
              value={phase === "ready" ? "✓" : "…"}
              label={phase === "ready" ? "WALLET ACTIVE • THE ARTISANS • " : "ACTIVATING • THE ARTISANS • "}
            />
          </div>
        </div>
        <h1 className="disp font-bold mt-5" style={{ fontSize: "1.8rem" }}>
          {phase === "ready" ? "Your wallet is active." : "Activating your account…"}
        </h1>
        <p className="mt-2 text-[15px]" style={{ color: MUTED }}>
          {phase === "ready"
            ? "Identity verified and a wallet is bound to your account — this is what escrow, staking, and payouts move through."
            : "Hold on while we verify your credentials and set up your on-chain wallet."}
        </p>

        <NetworkPicker walletChain={walletChain} onChange={setWalletChain} locked={phase !== "verifying"} />
        <ActivationSteps phase={phase} chainLabel={chain?.label} />
        {phase === "ready" && <WalletSummary walletAddress={walletAddress} chainLabel={chain?.label} chainSub={chain?.sub} />}

        <div className="flex justify-center gap-3 mt-7">
          <Btn
            primary
            disabled={phase !== "ready"}
            style={{ opacity: phase === "ready" ? 1 : 0.5 }}
            onClick={() => router.push(role === "artisan" ? "/dashboard" : "/")}
          >
            Continue {role === "artisan" ? "to dashboard" : "to The Artisans"}
          </Btn>
        </div>
      </div>
    </main>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={null}>
      <ActivateInner />
    </Suspense>
  );
}
