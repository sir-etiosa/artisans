"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Seal, Btn } from "@/components/ui";
import { MUTED, PAPER, LINE, INK } from "@/lib/theme";

function VerifyEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <main className="max-w-lg mx-auto px-4 md:px-8 pt-16">
      <div className="card soft p-8 text-center fade">
        <div className="flex justify-center"><Seal size={72} value="✉" label="CHECK YOUR INBOX • THE ARTISANS • " /></div>
        <h1 className="disp font-bold mt-5" style={{ fontSize: "1.8rem" }}>Verify your email</h1>
        <p className="mt-2 text-[15px]" style={{ color: MUTED }}>
          We sent a verification link to {email ? <b style={{ color: INK }}>{email}</b> : "your email address"}. Click it to activate your account — the link expires in 30 minutes.
        </p>
        <div className="mt-5 p-4 rounded-xl text-left text-[13px]" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
          <p style={{ color: MUTED }}>Don’t see it? Check spam, or make sure the email address is correct.</p>
        </div>
        <div className="flex justify-center mt-7">
          <Btn onClick={() => router.push("/auth")}>Back to sign in</Btn>
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}
