import { CARD, INK, MIST, MUTED } from "@/lib/theme";

const TABS = [["signup", "Create account"], ["login", "Log in"]];

export default function AuthTabs({ authTab, onChange }) {
  return (
    <div className="flex p-1 rounded-full" style={{ background: MIST }} role="tablist" aria-label="Sign up or log in">
      {TABS.map(([k, l]) => (
        <button key={k} role="tab" aria-selected={authTab === k} onClick={() => onChange(k)}
          className="btn flex-1 py-2 text-sm font-semibold"
          style={{
            borderRadius: 999, background: authTab === k ? CARD : "transparent", color: authTab === k ? INK : MUTED,
            boxShadow: authTab === k ? "0 1px 3px rgba(15,37,89,.12)" : "none",
          }}>
          {l}
        </button>
      ))}
    </div>
  );
}
