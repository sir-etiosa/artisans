import { CARD, FOREST, LINE, MIST, MUTED } from "@/lib/theme";

const OPTIONS = [
  ["customer", "I need artisans", "Search, book, pay in escrow"],
  ["artisan", "I am an artisan", "Get verified, get booked"],
];

export default function RoleChoice({ role, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3 mt-6" role="radiogroup" aria-label="Account type">
      {OPTIONS.map(([k, t, d]) => (
        <button key={k} type="button" role="radio" aria-checked={role === k} onClick={() => onChange(k)}
          className="hoverable text-left p-4 rounded-xl"
          style={{ background: CARD, border: `1.5px solid ${role === k ? FOREST : LINE}`, boxShadow: role === k ? `0 0 0 3px ${MIST}` : "none" }}>
          <p className="font-semibold text-[15px]">{t}</p>
          <p className="text-[13px] mt-0.5" style={{ color: MUTED }}>{d}</p>
        </button>
      ))}
    </div>
  );
}
