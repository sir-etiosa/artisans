import { createHash } from "crypto";

// Fingerprint for one real-world document — used to stop the same ID from
// verifying more than one account. Cleanverse's API doesn't police this
// across separate wallets/customerIds, so it has to happen on our side.
export function documentHash({ issuingCountryISO2, idType, idNumber }) {
  return createHash("sha256")
    .update(`${issuingCountryISO2.toUpperCase()}:${idType}:${idNumber.trim().toUpperCase()}`, "utf8")
    .digest("hex");
}
