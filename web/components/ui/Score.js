import { BRASS_SOFT, BRASS, FOREST, MUTED } from "@/lib/theme";

// Below 40: same gold/yellow used elsewhere for "needs attention". From 40
// up, shades of green get richer and more saturated the closer the score
// gets to 100 — a duller mossy green at 40, a bright glossy one near 99+.
const GREEN_STOPS = [
  { at: 40, bg: "#CFE8C4", fg: "#1F4A17" },
  { at: 50, bg: "#B7DFA6", fg: "#1B4113" },
  { at: 60, bg: "#98D17E", fg: "#173810" },
  { at: 75, bg: "#6FBD4E", fg: "#0F2B0A" },
  { at: 88, bg: "#3FA524", fg: "#ffffff" },
  { at: 99, bg: "#1E8A0C", fg: "#ffffff" },
];

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function mixHex(hexA, hexB, t) {
  const a = [1, 3, 5].map((i) => parseInt(hexA.slice(i, i + 2), 16));
  const b = [1, 3, 5].map((i) => parseInt(hexB.slice(i, i + 2), 16));
  return `#${a.map((v, i) => lerp(v, b[i], t).toString(16).padStart(2, "0")).join("")}`;
}

function scoreColor(v) {
  if (v < 40) return { bg: BRASS_SOFT, fg: FOREST, border: `${BRASS}66`, glow: false };

  const clamped = Math.min(99, Math.max(40, v));
  let lo = GREEN_STOPS[0];
  let hi = GREEN_STOPS[GREEN_STOPS.length - 1];
  for (let i = 0; i < GREEN_STOPS.length - 1; i++) {
    if (clamped >= GREEN_STOPS[i].at && clamped <= GREEN_STOPS[i + 1].at) {
      lo = GREEN_STOPS[i];
      hi = GREEN_STOPS[i + 1];
      break;
    }
  }
  const span = hi.at - lo.at || 1;
  const t = (clamped - lo.at) / span;
  const bg = mixHex(lo.bg, hi.bg, t);
  const fg = t > 0.5 ? hi.fg : lo.fg;
  return { bg, fg, border: `${bg}`, glow: v >= 90 };
}

export default function Score({ v, small }) {
  const { bg, fg, border, glow } = scoreColor(v);
  return (
    <span
      className="disp inline-flex items-baseline gap-0.5 font-bold"
      style={{
        background: bg, color: fg, border: `1px solid ${border}`,
        borderRadius: 8, padding: small ? "2px 8px" : "4px 10px", fontSize: small ? 14 : 17,
        boxShadow: glow ? `0 0 10px -1px ${bg}, 0 0 2px 0 #ffffffaa inset` : "none",
      }}
      title="Trust Score — completion rate, ratings, response time, repeat clients"
    >
      {v}<span style={{ fontSize: 10, fontWeight: 500, color: fg === "#ffffff" ? "#ffffffcc" : MUTED }}>/100</span>
    </span>
  );
}
