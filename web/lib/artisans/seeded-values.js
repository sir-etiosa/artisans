// Deterministic per-id "flavor" values (distance, avatar swatch) that we
// don't have real data for yet — same id always gets the same value,
// rather than jittering between renders.
const PASTELS = ["#E8DFC9", "#D6E4DC", "#E4E0EE", "#F0E2D6"];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return hash;
}

export function seededKm(id) {
  return Number((0.5 + (hashString(id) % 600) / 100).toFixed(1));
}

export function seededAvatarColor(id) {
  return PASTELS[hashString(id) % PASTELS.length];
}
