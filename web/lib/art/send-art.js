// ART is deployed (0x96F652EAd14F1E34695a2000A86a478fDf70D9F8, Monad
// testnet) but the operator wallet hasn't been granted MINTER_ROLE / funded
// with a working balance yet — see docs/cleanverse.md. These stubs keep the
// deposit/withdrawal flows honest: they refuse rather than pretending
// tokens moved, so "credited"/"paid" always means real ART actually moved.

// Placeholder rate until a real oracle/config exists — 1 ART = ₦1000.
export const NAIRA_PER_ART = 1000;

export function koboToArt(amountKobo) {
  return amountKobo / 100 / NAIRA_PER_ART;
}

export function artToKobo(amountArt) {
  return Math.round(amountArt * NAIRA_PER_ART * 100);
}

export function isArtTokenConfigured() {
  return Boolean(process.env.ART_TOKEN_ADDRESS && process.env.ART_OPERATOR_PRIVATE_KEY);
}

export async function sendArtToUser({ toAddress, amountArt }) {
  if (!isArtTokenConfigured() || !toAddress) {
    return { ok: false, error: "ART token isn't deployed yet — nothing to send" };
  }
  // TODO: real on-chain ERC20 transfer from the operator wallet once it holds MINTER_ROLE.
  return { ok: false, error: "ART transfer not implemented yet" };
}

export async function returnArtToTreasury({ fromAddress, amountArt }) {
  if (!isArtTokenConfigured() || !fromAddress) {
    return { ok: false, error: "ART token isn't wired up yet — nothing to return" };
  }
  // TODO: real on-chain ERC20 transfer from the user's custodial wallet back to the Safe.
  return { ok: false, error: "ART return not implemented yet" };
}
