import { BRASS, LINE } from "@/lib/theme";

export default function Stars({ n }) {
  return (
    <span aria-label={`${n} out of 5 stars`} style={{ color: BRASS, letterSpacing: 1 }}>
      {"★".repeat(n)}<span style={{ color: LINE }}>{"★".repeat(5 - n)}</span>
    </span>
  );
}
