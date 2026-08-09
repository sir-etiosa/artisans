"use client";

import { useState } from "react";
import { LINE, MUTED, PINE } from "@/lib/theme";

export default function CopyWalletRow({ walletAddress }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex justify-between items-center py-3" style={{ borderBottom: `1px solid ${LINE}` }}>
      <span className="text-[13px]" style={{ color: MUTED }}>Wallet</span>
      {walletAddress ? (
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium" style={{ fontFamily: "monospace" }}>
            {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
          </span>
          <button type="button" onClick={copy} className="text-[12px] font-semibold underline" style={{ color: PINE }}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      ) : (
        <span className="text-[13px] font-medium">Not activated</span>
      )}
    </div>
  );
}
