// Deterministic per-id avatar swatch — same id always gets the same color,
// rather than jittering between renders.
const PASTELS = ["#E8DFC9", "#D6E4DC", "#E4E0EE", "#F0E2D6"];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return hash;
}

export function seededAvatarColor(id) {
  return PASTELS[hashString(id) % PASTELS.length];
}
