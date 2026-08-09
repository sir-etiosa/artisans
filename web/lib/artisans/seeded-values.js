// Deterministic per-id avatar swatch — same id always gets the same color,
// rather than jittering between renders.
const PASTELS = ["#C9A860", "#7FAF9B", "#A98BC4", "#D98F63", "#6B9FC4", "#C97F91"];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return hash;
}

export function seededAvatarColor(id) {
  return PASTELS[hashString(id) % PASTELS.length];
}
