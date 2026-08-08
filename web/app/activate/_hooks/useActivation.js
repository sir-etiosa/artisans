"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* Wallet is provisioned server-side during email verification (see
   /api/auth/verify) — this just waits for that user record to load. */
export function useActivation() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setUser(data.user))
      .catch(() => router.replace("/auth"));
  }, [router]);

  const role = user?.role === "artisan" ? "artisan" : "customer";
  const phase = user?.walletAddress ? "ready" : "verifying";

  return { phase, walletAddress: user?.walletAddress, walletChain: user?.walletChain, role };
}
