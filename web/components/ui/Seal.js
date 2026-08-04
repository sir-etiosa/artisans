import { BRASS, BRASS_SOFT, FOREST } from "@/lib/theme";

export default function Seal({ size = 84, value = "✓", label = "VERIFIED ARTISAN • THE ARTISANS • " }) {
  return (
    <div className="seal-spin" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <defs>
          <path id="sealcirc" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
        </defs>
        <circle cx="50" cy="50" r="48" fill={BRASS_SOFT} stroke={BRASS} strokeWidth="2" />
        <circle cx="50" cy="50" r="27" fill="none" stroke={BRASS} strokeWidth="1.4" strokeDasharray="2 3" />
        <text fontSize="8.6" fontWeight="600" letterSpacing="1.6" fill={BRASS}>
          <textPath href="#sealcirc">{label}{label}</textPath>
        </text>
        <text x="50" y="50" dy="7" textAnchor="middle" fontSize={String(value).length > 2 ? 17 : 22} fontWeight="700" fill={FOREST} fontFamily="'Inter',sans-serif">
          {value}
        </text>
      </svg>
    </div>
  );
}
