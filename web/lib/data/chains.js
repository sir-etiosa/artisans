export const CHAINS = [
  { id: "base", label: "Base", sub: "Sepolia testnet" },
  { id: "monad", label: "Monad", sub: "Testnet" },
];

/* Demo-only stand-in for a real wallet/A-Pass mint — swap for the Cleanverse
   integration when it lands; the activation UI/flow can stay the same. */
export const genWalletAddress = () =>
  "0x" + Array.from({ length: 40 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
