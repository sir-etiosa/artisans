"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Btn } from "@/components/ui";
import { MUTED } from "@/lib/theme";
import CopyWalletRow from "./CopyWalletRow";

export default function WalletCard({ user }) {
  const verified = user.verificationStatus === "verified";
  const [balance, setBalance] = useState(undefined); // undefined = loading

  useEffect(() => {
    fetch("/api/wallet/balance")
      .then((res) => (res.ok ? res.json() : { balanceArt: null, balanceNgn: null }))
      .then(setBalance);
  }, []);

  return (
    <section className="card soft p-6">
      <h2 className="disp font-bold text-[17px]">Wallet</h2>

      <div className="mt-3">
        <div className="py-3">
          <p className="text-[13px]" style={{ color: MUTED }}>Wallet Balance</p>
          <p className="disp font-bold mt-1" style={{ fontSize: "1.9rem" }}>
            {balance === undefined ? "…" : balance.balanceArt != null ? `${balance.balanceArt.toLocaleString()} ART` : "—"}
          </p>
          {balance?.balanceNgn != null && (
            <p className="text-[13px] mt-0.5" style={{ color: MUTED }}>≈ ₦{balance.balanceNgn.toLocaleString()}</p>
          )}
        </div>
        <CopyWalletRow walletAddress={user.walletAddress} />
      </div>

      <p className="text-[13px] mt-4" style={{ color: MUTED }}>
        {verified ? "Deposit NGN to top up your ART balance." : "Verify your identity to deposit or withdraw."}
      </p>
      <div className="flex gap-2 mt-3 flex-wrap">
        <Link href={verified ? "/deposit" : "#"} aria-disabled={!verified} style={{ pointerEvents: verified ? "auto" : "none" }}>
          <Btn primary small style={{ opacity: verified ? 1 : 0.4 }}>Deposit</Btn>
        </Link>
        <Link href={verified ? "/withdraw" : "#"} aria-disabled={!verified} style={{ pointerEvents: verified ? "auto" : "none" }}>
          <Btn small style={{ opacity: verified ? 1 : 0.4 }}>Withdraw</Btn>
        </Link>
        <Btn small disabled style={{ opacity: 0.4 }} title="Coming soon">Swap · Coming soon</Btn>
      </div>
    </section>
  );
}
