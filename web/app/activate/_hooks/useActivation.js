"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { genWalletAddress } from "@/lib/data";

/* Fetches the signed-in user, runs the verify → mint animation, and
   persists the generated wallet address back to their account. */
export function useActivation() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [walletChain, setWalletChain] = useState("base");
  const [phase, setPhase] = useState("verifying"); // verifying → minting → ready
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.user.walletAddress) {
          router.replace(data.user.role === "artisan" ? "/dashboard" : "/");
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.replace("/auth"));
  }, [router]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("minting"), 1100);
    const t2 = setTimeout(() => {
      const address = genWalletAddress();
      setWalletAddress(address);
      setPhase("ready");
      fetch("/api/auth/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, chain: walletChain }),
      }).catch(() => {}); // demo mint — non-blocking if this fails
    }, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const role = user?.role === "artisan" ? "artisan" : "customer";

  return { walletChain, setWalletChain, phase, walletAddress, role };
}
