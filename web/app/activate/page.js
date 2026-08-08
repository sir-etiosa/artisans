"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Seal, Btn } from "@/components/ui";
import { MUTED } from "@/lib/theme";
import { useActivation } from "./_hooks/useActivation";
import WalletSummary from "./_components/WalletSummary";

function ActivateInner() {
  const router = useRouter();
  const { phase, walletAddress, walletChain, role } = useActivation();

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
          {phase === "ready" ? "Your wallet is active." : "Setting up your account…"}
        </h1>
        <p className="mt-2 text-[15px]" style={{ color: MUTED }}>
          {phase === "ready"
            ? "A wallet is bound to your account. Head to Account & settings to verify your identity and unlock escrow, staking, and payouts."
            : "Hold on while we finish setting up your on-chain wallet."}
        </p>

        {phase === "ready" && (
          <WalletSummary walletAddress={walletAddress} chainLabel="Monad" chainSub={walletChain === "monad" ? "Testnet" : walletChain} />
        )}

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
