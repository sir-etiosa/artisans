import { BRASS_SOFT, FOREST, BRASS, MUTED } from "@/lib/theme";

export default function Score({ v, small }) {
  return (
    <span
      className="disp inline-flex items-baseline gap-0.5 font-bold"
      style={{
        background: BRASS_SOFT, color: FOREST, border: `1px solid ${BRASS}66`,
        borderRadius: 8, padding: small ? "2px 8px" : "4px 10px", fontSize: small ? 14 : 17,
      }}
      title="Trust Score — completion rate, ratings, response time, repeat clients"
    >
      {v}<span style={{ fontSize: 10, fontWeight: 500, color: MUTED }}>/100</span>
    </span>
  );
}
