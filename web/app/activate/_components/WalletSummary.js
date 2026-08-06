import { INK, LINE, MUTED, PAPER } from "@/lib/theme";

export default function WalletSummary({ walletAddress, chainLabel, chainSub }) {
  return (
    <div className="mt-5 p-4 rounded-xl text-left text-[13px]" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
      <p className="font-semibold" style={{ color: INK }}>Wallet address</p>
      <p className="mt-1" style={{ color: MUTED, wordBreak: "break-all", fontFamily: "monospace" }}>{walletAddress}</p>
      <p className="mt-1" style={{ color: MUTED }}>{chainLabel} · {chainSub}</p>
    </div>
  );
}
