// ART hasn't been deployed on-chain yet (waiting on the Safe address + the
// Cleanverse /atoken/launch call — see docs/cleanverse.md). This stub keeps
// the deposit-approval flow honest: it refuses rather than pretending to
// have sent tokens, so "credited" always means real ART actually moved.

// Placeholder rate until a real oracle/config exists — 1 ART = ₦1000.
export const NAIRA_PER_ART = 1000;

export function koboToArt(amountKobo) {
  return amountKobo / 100 / NAIRA_PER_ART;
}

export function isArtTokenConfigured() {
  return Boolean(process.env.ART_TOKEN_ADDRESS && process.env.ART_OPERATOR_PRIVATE_KEY);
}

export async function sendArtToUser({ toAddress, amountArt }) {
  if (!isArtTokenConfigured() || !toAddress) {
    return { ok: false, error: "ART token isn't deployed yet — nothing to send" };
  }
  // TODO: real on-chain ERC20 transfer from the operator wallet once ART is issued.
  return { ok: false, error: "ART transfer not implemented yet" };
}
