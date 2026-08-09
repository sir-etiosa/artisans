import { parseUnits, formatUnits } from "viem";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { monadPublicClient, operatorWalletClient, userWalletClient } from "./monad-client";
import { NAIRA_PER_ART } from "./constants";

// ART is live (0x96F652EAd14F1E34695a2000A86a478fDf70D9F8, Monad testnet),
// the operator wallet holds MINTER_ROLE and a 500M working float, and the
// Safe treasury holds the other 500M — see docs/cleanverse.md for the full
// setup. These functions do real on-chain transfers now.

export { NAIRA_PER_ART };
// ART's compliance-rule check makes transfers real gas-heavy — confirmed
// live at ~302k gas (vs. ~60k for a plain ERC20 transfer), so this needs
// real margin, not a token amount.
const GAS_TOPUP_WEI = 80000000000000000n; // 0.08 MON

export function koboToArt(amountKobo) {
  return amountKobo / 100 / NAIRA_PER_ART;
}

export function artToKobo(amountArt) {
  return Math.round(amountArt * NAIRA_PER_ART * 100);
}

export function nairaToArt(amountNaira) {
  return amountNaira / NAIRA_PER_ART;
}

export function isArtTokenConfigured() {
  return Boolean(process.env.ART_TOKEN_ADDRESS && process.env.ART_OPERATOR_USER_EMAIL && process.env.MONAD_RPC_URL);
}

const ERC20_TRANSFER_ABI = [
  { type: "function", name: "transfer", inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }], stateMutability: "nonpayable" },
];

const ERC20_BALANCE_ABI = [
  { type: "function", name: "balanceOf", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
];

export async function getArtBalance(address) {
  if (!isArtTokenConfigured() || !address) return null;
  const raw = await monadPublicClient().readContract({
    address: process.env.ART_TOKEN_ADDRESS,
    abi: ERC20_BALANCE_ABI,
    functionName: "balanceOf",
    args: [address],
  });
  return Number(formatUnits(raw, 18));
}

// Explicit gas required — viem's automatic estimation unreliably fails
// against Monad's RPC for this call (compliance-rule checks make it far
// heavier than a plain ERC20 transfer, ~302k gas measured live), surfacing
// as a misleading "insufficient balance" error even with ample funds.
const TRANSFER_GAS_LIMIT = 500000n;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Confirmed live: a second transfer sent moments after a first from the
// same wallet can revert with "Signer had insufficient balance" even
// though the balance is genuinely sufficient — reads on Monad's
// load-balanced RPC pool occasionally lag a beat behind a just-confirmed
// tx on a different node. One short retry clears it every time it's been
// observed; a real insufficient-balance case still fails after the retry.
async function transferArt({ walletClient, toAddress, amountArt, attempt = 1 }) {
  try {
    const hash = await walletClient.writeContract({
      address: process.env.ART_TOKEN_ADDRESS,
      abi: ERC20_TRANSFER_ABI,
      functionName: "transfer",
      args: [toAddress, parseUnits(String(amountArt), 18)],
      gas: TRANSFER_GAS_LIMIT,
    });
    const receipt = await monadPublicClient().waitForTransactionReceipt({ hash });
    return { ok: receipt.status === "success", txHash: hash };
  } catch (err) {
    const looksLikeStaleRead = /insufficient balance/i.test(err.shortMessage || err.message || "");
    if (looksLikeStaleRead && attempt < 3) {
      await sleep(1500 * attempt);
      return transferArt({ walletClient, toAddress, amountArt, attempt: attempt + 1 });
    }
    throw err;
  }
}

// Deposit approval — operator's own float, operator's own gas. Simple.
export async function sendArtToUser({ toAddress, amountArt }) {
  if (!isArtTokenConfigured() || !toAddress) {
    return { ok: false, error: "ART token isn't deployed yet — nothing to send" };
  }
  try {
    const { client } = await operatorWalletClient();
    const result = await transferArt({ walletClient: client, toAddress, amountArt });
    if (!result.ok) return { ok: false, error: "On-chain transfer failed" };
    return { ok: true, txHash: result.txHash };
  } catch (err) {
    return { ok: false, error: err.shortMessage || err.message || "ART transfer failed" };
  }
}

// Shared core for any transfer that must be signed by a user's own wallet,
// which never holds gas on its own — operator sponsors a tiny MON top-up
// first (the "sponsor gas for all of us" arrangement), then the user's own
// key signs the real transfer to whatever destination is asked for.
async function transferFromUserWallet({ fromAddress, toAddress, amountArt }) {
  if (!isArtTokenConfigured() || !fromAddress) {
    return { ok: false, error: "ART token isn't wired up yet" };
  }
  try {
    const publicClient = monadPublicClient();
    const balance = await publicClient.getBalance({ address: fromAddress });
    if (balance < GAS_TOPUP_WEI) {
      const { client: operator } = await operatorWalletClient();
      const topupHash = await operator.sendTransaction({ to: fromAddress, value: GAS_TOPUP_WEI });
      await publicClient.waitForTransactionReceipt({ hash: topupHash });
    }

    const { client } = await userWalletClient(fromAddress);
    const result = await transferArt({ walletClient: client, toAddress, amountArt });
    if (!result.ok) return { ok: false, error: "On-chain transfer failed" };
    return { ok: true, txHash: result.txHash };
  } catch (err) {
    return { ok: false, error: err.shortMessage || err.message || "ART transfer failed" };
  }
}

// Withdrawal — user's wallet straight to the cold Safe treasury.
export async function returnArtToTreasury({ fromAddress, amountArt }) {
  return transferFromUserWallet({ fromAddress, toAddress: process.env.ART_SAFE_ADDRESS, amountArt });
}

// Booking escrow lock — customer's wallet to the operator wallet, which
// acts as the escrow holder. Release/refund out of escrow reuses
// sendArtToUser below (operator already knows how to send to anyone).
export async function escrowFromUser({ fromAddress, amountArt }) {
  const operator = await db.query.users.findFirst({ where: eq(users.email, process.env.ART_OPERATOR_USER_EMAIL) });
  if (!operator?.walletAddress) return { ok: false, error: "Escrow wallet isn't configured" };
  return transferFromUserWallet({ fromAddress, toAddress: operator.walletAddress, amountArt });
}
