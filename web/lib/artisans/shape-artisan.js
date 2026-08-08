import { seededAvatarColor, seededKm } from "./seeded-values";

// Maps DB rows onto the field names the existing UI components already
// expect (kept from the old fixture) so pages only need a new data
// source, not a rewrite. portfolio/reviews are intentionally absent —
// consuming components hide those sections when they're missing.
export function shapeArtisan(row) {
  return {
    id: row.id,
    name: row.fullName,
    email: row.email,
    trade: row.trade,
    level: row.trustScore >= 90 ? "Professional" : "Intermediate",
    tag: row.tagline,
    area: row.area,
    rate: row.rate,
    score: row.trustScore,
    rating: row.rating,
    jobs: row.jobsCompleted,
    years: row.yearsExperience,
    response: row.responseMinutes != null ? `${row.responseMinutes} min` : undefined,
    repeat: row.repeatClientPct != null ? `${row.repeatClientPct}%` : undefined,
    since: row.createdAt ? new Date(row.createdAt).getFullYear().toString() : undefined,
    bio: row.bio,
    certs: row.certs || [],
    breakdown: row.breakdown || {},
    avatarColor: seededAvatarColor(row.id),
    km: seededKm(row.id),
  };
}
