import { CHAINS } from "@/lib/data";
import { CARD, FOREST, INK, LINE, MIST, MUTED } from "@/lib/theme";

export default function NetworkPicker({ walletChain, onChange, locked }) {
  return (
    <div className="mt-6 text-left">
      <p className="label !mb-2">Network</p>
      <div className="flex gap-2">
        {CHAINS.map((c) => (
          <button
            key={c.id}
            disabled={locked}
            onClick={() => onChange(c.id)}
            className="btn flex-1 text-left p-3 rounded-xl"
            style={{
              border: `1.5px solid ${walletChain === c.id ? FOREST : LINE}`,
              background: walletChain === c.id ? MIST : CARD,
              opacity: locked && walletChain !== c.id ? 0.5 : 1,
            }}
          >
            <span className="font-semibold text-[14px]" style={{ color: INK }}>{c.label}</span>
            <span className="block text-[12px]" style={{ color: MUTED }}>{c.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
