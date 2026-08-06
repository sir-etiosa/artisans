import { BRASS, BRASS_SOFT, FOREST, MUTED } from "@/lib/theme";

export default function VerificationNote() {
  return (
    <div className="mt-5 p-4 rounded-xl text-[13px]" style={{ background: BRASS_SOFT, border: `1px solid ${BRASS}55`, color: FOREST }}>
      <p className="font-semibold">Next: verification (free, ~5 min)</p>
      <p className="mt-1" style={{ color: MUTED }}>① Verify email → ② Government ID → ③ Selfie match → ④ NIN/BVN. You appear in search only after all four clear.</p>
    </div>
  );
}
