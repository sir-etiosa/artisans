"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Seal, Btn } from "@/components/ui";
import { MUTED, RED } from "@/lib/theme";

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState(token ? null : "This reset link is missing its token.");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-lg mx-auto px-4 md:px-8 pt-16">
      <div className="card soft p-8 text-center fade">
        <div className="flex justify-center"><Seal size={72} value={done ? "✓" : "🔑"} label="THE ARTISANS • ACCOUNT RECOVERY • " /></div>
        <h1 className="disp font-bold mt-5" style={{ fontSize: "1.8rem" }}>
          {done ? "Password updated." : "Choose a new password"}
        </h1>
        <p className="mt-2 text-[15px]" style={{ color: MUTED }}>
          {done ? "Log in with your new password." : "8+ characters. This link only works once."}
        </p>

        {!done && token && (
          <form className="mt-6 space-y-4 text-left" onSubmit={submit}>
            <div>
              <label className="label" htmlFor="pw">New password</label>
              <input id="pw" type="password" className="field" placeholder="8+ characters" autoComplete="new-password"
                value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
            <div>
              <label className="label" htmlFor="pw2">Confirm password</label>
              <input id="pw2" type="password" className="field" placeholder="Repeat it" autoComplete="new-password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} />
            </div>
            {error && <p className="text-[13px] font-medium" style={{ color: RED }}>{error}</p>}
            <Btn primary className="w-full !py-3.5" type="submit" disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>
              {loading ? "Updating…" : "Update password"}
            </Btn>
          </form>
        )}
        {error && !token && <p className="mt-4 text-[13px] font-medium" style={{ color: RED }}>{error}</p>}

        <div className="flex justify-center mt-7">
          <Btn onClick={() => router.push("/auth")}>Back to sign in</Btn>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
