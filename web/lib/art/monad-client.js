import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { decryptSecret } from "@/lib/crypto/secret";

export const monadTestnet = {
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [process.env.MONAD_RPC_URL] } },
};

export function monadPublicClient() {
  return createPublicClient({ chain: monadTestnet, transport: http(process.env.MONAD_RPC_URL) });
}

function walletClientFor(privateKey) {
  const account = privateKeyToAccount(privateKey);
  return { client: createWalletClient({ account, chain: monadTestnet, transport: http(process.env.MONAD_RPC_URL) }), address: account.address };
}

// The operator wallet — one designated user's custodial wallet, holding
// MINTER_ROLE and a working ART float. See docs/cleanverse.md.
export async function operatorWalletClient() {
  const operator = await db.query.users.findFirst({ where: eq(users.email, process.env.ART_OPERATOR_USER_EMAIL) });
  if (!operator?.walletPrivateKeyEnc) throw new Error("Operator wallet not configured");
  return walletClientFor(decryptSecret(operator.walletPrivateKeyEnc));
}

// Any user's own custodial wallet, for transfers that must originate from them.
export async function userWalletClient(walletAddress) {
  const user = await db.query.users.findFirst({ where: eq(users.walletAddress, walletAddress) });
  if (!user?.walletPrivateKeyEnc) throw new Error("No signing key for this wallet");
  return walletClientFor(decryptSecret(user.walletPrivateKeyEnc));
}
