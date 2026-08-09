"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Btn, Seal, Logo } from "@/components/ui";
import { MUTED } from "@/lib/theme";

const MESSAGES = {
  checking: { title: "Confirming your payment…", body: "Hang on a moment." },
  awaiting_credit: { title: "Payment received", body: "Your deposit is confirmed and pending review — ART lands in your wallet once approved." },
  credited: { title: "ART sent", body: "Your ART balance has been updated." },
  failed: { title: "Payment didn't go through", body: "The transaction wasn't successful — nothing was charged to your ART balance." },
  error: { title: "Couldn't confirm this payment", body: "If you were charged, contact support with your reference." },
};

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    if (!reference) { Promise.resolve().then(() => setStatus("error")); return; }
    fetch("/api/deposits/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => setStatus(ok ? (data.deposit?.status || "checking") : "error"))
      .catch(() => setStatus("error"));
  }, [reference]);

  const { title, body } = MESSAGES[status] || MESSAGES.checking;

  return (
    <main className="max-w-lg mx-auto px-4 md:px-8 pt-16">
      <div className="card soft p-8 text-center fade">
        <div className="flex justify-center"><Logo size={40} /></div>
        <div className="flex justify-center mt-4"><Seal size={72} value={status === "checking" ? "…" : "✓"} label="THE ARTISANS • DEPOSIT • " /></div>
        <h1 className="disp font-bold mt-5" style={{ fontSize: "1.8rem" }}>{title}</h1>
        <p className="mt-2 text-[15px]" style={{ color: MUTED }}>{body}</p>
        <div className="flex justify-center mt-7">
          <Btn primary onClick={() => router.push("/account")}>Back to account</Btn>
        </div>
      </div>
    </main>
  );
}

export default function DepositCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackInner />
    </Suspense>
  );
}
