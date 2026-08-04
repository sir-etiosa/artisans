"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Seal, Btn } from "@/components/ui";
import { CHAINS, genWalletAddress } from "@/lib/data";
import { FOREST, INK, CARD, PAPER, MIST, LINE, MUTED, BRASS, PINE } from "@/lib/theme";

function ActivateInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") === "artisan" ? "artisan" : "customer";

  const [walletChain, setWalletChain] = useState("base");
  const [phase, setPhase] = useState("verifying"); // verifying → minting → ready
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("minting"), 1100);
    const t2 = setTimeout(() => {
      setWalletAddress(genWalletAddress());
      setPhase("ready");
    }, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const chainLabel = CHAINS.find((c) => c.id === walletChain)?.label;
  const chainSub = CHAINS.find((c) => c.id === walletChain)?.sub;

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

        <div className="mt-6 text-left">
          <p className="label !mb-2">Network</p>
          <div className="flex gap-2">
            {CHAINS.map((c) => (
              <button
                key={c.id}
                disabled={phase !== "verifying"}
                onClick={() => setWalletChain(c.id)}
                className="btn flex-1 text-left p-3 rounded-xl"
                style={{
                  border: `1.5px solid ${walletChain === c.id ? FOREST : LINE}`,
                  background: walletChain === c.id ? MIST : CARD,
                  opacity: phase !== "verifying" && walletChain !== c.id ? 0.5 : 1,
                }}
              >
                <span className="font-semibold text-[14px]" style={{ color: INK }}>{c.label}</span>
                <span className="block text-[12px]" style={{ color: MUTED }}>{c.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-2.5 text-left">
          {[
            { k: "verifying", label: "Verifying your credentials" },
            { k: "minting", label: `Minting your wallet on ${chainLabel}` },
          ].map((s, i) => {
            const order = ["verifying", "minting", "ready"];
            const done = order.indexOf(phase) > i;
            const active = phase === s.k;
            return (
              <div key={s.k} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
                <span
                  aria-hidden="true"
                  className={active ? "spinner inline-block" : "inline-block"}
                  style={{ width: 20, textAlign: "center", color: done ? PINE : active ? BRASS : MUTED }}
                >
                  {done ? "✓" : active ? "◐" : "○"}
                </span>
                <span className="text-[13px] font-medium" style={{ color: done || active ? INK : MUTED }}>{s.label}</span>
              </div>
            );
          })}
        </div>

        {phase === "ready" && (
          <div className="mt-5 p-4 rounded-xl text-left text-[13px]" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
            <p className="font-semibold" style={{ color: INK }}>Wallet address</p>
            <p className="mt-1" style={{ color: MUTED, wordBreak: "break-all", fontFamily: "monospace" }}>{walletAddress}</p>
            <p className="mt-1" style={{ color: MUTED }}>{chainLabel} · {chainSub}</p>
          </div>
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
