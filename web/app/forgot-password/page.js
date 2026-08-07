"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Seal, Btn } from "@/components/ui";
import { MUTED, RED } from "@/lib/theme";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Something went wrong");
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-lg mx-auto px-4 md:px-8 pt-16">
      <div className="card soft p-8 text-center fade">
        <div className="flex justify-center"><Seal size={72} value={sent ? "✉" : "?"} label="THE ARTISANS • ACCOUNT RECOVERY • " /></div>
        <h1 className="disp font-bold mt-5" style={{ fontSize: "1.8rem" }}>
          {sent ? "Check your email" : "Forgot your password?"}
        </h1>
        <p className="mt-2 text-[15px]" style={{ color: MUTED }}>
          {sent
            ? `If an account exists for ${email}, we've sent a link to reset your password. It expires in 30 minutes.`
            : "Enter the email on your account and we'll send you a reset link."}
        </p>

        {!sent && (
          <form className="mt-6 space-y-4 text-left" onSubmit={submit}>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" className="field" placeholder="richard@example.com" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {error && <p className="text-[13px] font-medium" style={{ color: RED }}>{error}</p>}
            <Btn primary className="w-full !py-3.5" type="submit" disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>
              {loading ? "Sending…" : "Send reset link"}
            </Btn>
          </form>
        )}

        <div className="flex justify-center mt-7">
          <Btn onClick={() => router.push("/auth")}>Back to sign in</Btn>
        </div>
      </div>
    </main>
  );
}
