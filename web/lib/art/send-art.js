import { parseUnits } from "viem";
import { monadPublicClient, operatorWalletClient, userWalletClient } from "./monad-client";

// ART is live (0x96F652EAd14F1E34695a2000A86a478fDf70D9F8, Monad testnet),
// the operator wallet holds MINTER_ROLE and a 500M working float, and the
// Safe treasury holds the other 500M — see docs/cleanverse.md for the full
// setup. These functions do real on-chain transfers now.

export const NAIRA_PER_ART = 1000;
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

export function isArtTokenConfigured() {
  return Boolean(process.env.ART_TOKEN_ADDRESS && process.env.ART_OPERATOR_USER_EMAIL && process.env.MONAD_RPC_URL);
}

const ERC20_TRANSFER_ABI = [
  { type: "function", name: "transfer", inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }], stateMutability: "nonpayable" },
];

// Explicit gas required — viem's automatic estimation unreliably fails
// against Monad's RPC for this call (compliance-rule checks make it far
// heavier than a plain ERC20 transfer, ~302k gas measured live), surfacing
// as a misleading "insufficient balance" error even with ample funds.
const TRANSFER_GAS_LIMIT = 500000n;

async function transferArt({ walletClient, toAddress, amountArt }) {
  const hash = await walletClient.writeContract({
    address: process.env.ART_TOKEN_ADDRESS,
    abi: ERC20_TRANSFER_ABI,
    functionName: "transfer",
    args: [toAddress, parseUnits(String(amountArt), 18)],
    gas: TRANSFER_GAS_LIMIT,
  });
  const receipt = await monadPublicClient().waitForTransactionReceipt({ hash });
  return { ok: receipt.status === "success", txHash: hash };
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

// Withdrawal — must move FROM the user's own wallet, which never holds gas.
// Operator sponsors a tiny MON top-up first (this is the "sponsor gas for
// all of us" arrangement), then the user's own key signs the real transfer.
export async function returnArtToTreasury({ fromAddress, amountArt }) {
  if (!isArtTokenConfigured() || !fromAddress) {
    return { ok: false, error: "ART token isn't wired up yet — nothing to return" };
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
    const treasuryAddress = process.env.ART_SAFE_ADDRESS;
    const result = await transferArt({ walletClient: client, toAddress: treasuryAddress, amountArt });
    if (!result.ok) return { ok: false, error: "On-chain transfer failed" };
    return { ok: true, txHash: result.txHash };
  } catch (err) {
    return { ok: false, error: err.shortMessage || err.message || "ART return failed" };
  }
}
