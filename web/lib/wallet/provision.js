import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { encryptPrivateKey } from "./crypto";

/* Custodial EOA for a user — never exposed client-side, never needs its own
   gas (see lib/cleanverse and the relayer design docs). */
export function provisionWallet() {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  return { address: account.address, encryptedPrivateKey: encryptPrivateKey(privateKey) };
}
