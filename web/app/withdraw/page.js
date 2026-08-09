"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ui";
import { MUTED, RED, PINE, FOREST, PAPER, LINE } from "@/lib/theme";

export default function WithdrawPage() {
  const router = useRouter();
  const [bankAccount, setBankAccount] = useState(undefined);
  const [banks, setBanks] = useState([]);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState(null);

  const [artAmount, setArtAmount] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    fetch("/api/bank-accounts").then((r) => r.json()).then((d) => setBankAccount(d.bankAccount));
    fetch("/api/banks").then((r) => (r.ok ? r.json() : { banks: [] })).then((d) => setBanks(d.banks || []));
  }, []);

  const linkBank = async (e) => {
    e.preventDefault();
    setLinking(true);
    setLinkError(null);
    try {
      const res = await fetch("/api/bank-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankCode, accountNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't link account");
      setBankAccount(data.bankAccount);
    } catch (err) {
      setLinkError(err.message);
    } finally {
      setLinking(false);
    }
  };

  const requestWithdrawal = async (e) => {
    e.preventDefault();
    setRequesting(true);
    setRequestError(null);
    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't request withdrawal");
      setRequested(true);
    } catch (err) {
      setRequestError(err.message);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <main className="max-w-lg mx-auto px-4 md:px-8 pt-16 pb-16">
      <button onClick={() => router.push("/account")} className="text-sm font-semibold underline" style={{ color: PINE }}>← Account</button>

      <div className="card soft p-8 mt-5">
        <h1 className="disp font-bold" style={{ fontSize: "1.8rem" }}>Withdraw</h1>

        {bankAccount === undefined && <p className="mt-4 text-[14px]" style={{ color: MUTED }}>Loading…</p>}

        {bankAccount === null && (
          <>
            <p className="mt-2 text-[14px]" style={{ color: MUTED }}>Link a bank account before you can withdraw.</p>
            <form onSubmit={linkBank} className="mt-5 space-y-4">
              <div>
                <label className="label" htmlFor="bank">Bank</label>
                <select id="bank" className="field" value={bankCode} onChange={(e) => setBankCode(e.target.value)} required>
                  <option value="">Select your bank</option>
                  {banks.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="acct">Account number</label>
                <input id="acct" className="field" maxLength={10} placeholder="0123456789"
                  value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
              </div>
              {linkError && <p className="text-[13px] font-medium" style={{ color: RED }}>{linkError}</p>}
              <Btn primary className="w-full !py-3.5" type="submit" disabled={linking} style={{ opacity: linking ? 0.6 : 1 }}>
                {linking ? "Verifying…" : "Link account"}
              </Btn>
            </form>
          </>
        )}

        {bankAccount && !requested && (
          <>
            <div className="mt-4 p-4 rounded-xl text-[13px]" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
              <p className="font-semibold" style={{ color: FOREST }}>{bankAccount.accountName}</p>
              <p style={{ color: MUTED }}>{bankAccount.bankName} · {bankAccount.accountNumber}</p>
            </div>
            <form onSubmit={requestWithdrawal} className="mt-5 space-y-4">
              <div>
                <label className="label" htmlFor="art">Amount (ART)</label>
                <input id="art" type="number" min="1" step="1" className="field"
                  value={artAmount} onChange={(e) => setArtAmount(e.target.value)} required />
              </div>
              {requestError && <p className="text-[13px] font-medium" style={{ color: RED }}>{requestError}</p>}
              <Btn primary className="w-full !py-3.5" type="submit" disabled={requesting} style={{ opacity: requesting ? 0.6 : 1 }}>
                {requesting ? "Requesting…" : "Request withdrawal"}
              </Btn>
            </form>
          </>
        )}

        {requested && (
          <p className="mt-4 text-[14px]" style={{ color: MUTED }}>Withdrawal requested — it&apos;s pending review before payout.</p>
        )}
      </div>
    </main>
  );
}
