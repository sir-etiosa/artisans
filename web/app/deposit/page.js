"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ui";
import { MUTED, RED, PINE } from "@/lib/theme";

export default function DepositPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountNaira: amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't start deposit");
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="max-w-lg mx-auto px-4 md:px-8 pt-16">
      <button onClick={() => router.push("/account")} className="text-sm font-semibold underline" style={{ color: PINE }}>← Account</button>
      <div className="card soft p-8 mt-5">
        <h1 className="disp font-bold" style={{ fontSize: "1.8rem" }}>Deposit</h1>
        <p className="mt-2 text-[14px]" style={{ color: MUTED }}>
          Fund your account via bank transfer or card. Your deposit is reviewed before ART lands in your wallet.
        </p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="amount">Amount (₦)</label>
            <input id="amount" type="number" min="100" step="1" className="field" placeholder="5000"
              value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          {error && <p className="text-[13px] font-medium" style={{ color: RED }}>{error}</p>}
          <Btn primary className="w-full !py-3.5" type="submit" disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>
            {loading ? "Starting…" : "Continue to Paystack"}
          </Btn>
        </form>
      </div>
    </main>
  );
}
