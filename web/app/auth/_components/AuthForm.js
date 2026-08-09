"use client";

import { useState } from "react";
import Link from "next/link";
import { Btn } from "@/components/ui";
import { MUTED, PINE, RED } from "@/lib/theme";

export default function AuthForm({ form }) {
  const { authTab, role, fullName, setFullName, email, setEmail, phone, setPhone, password, setPassword, error, loading, submit } = form;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="mt-6 space-y-4" onSubmit={submit}>
      {authTab === "signup" && (
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" className="field" placeholder="Richard Okonkwo" autoComplete="name"
            value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" type="email" className="field" placeholder="richard@example.com" autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      {authTab === "signup" && (
        <div>
          <label className="label" htmlFor="phone">Phone number</label>
          <input id="phone" className="field" placeholder="+234 801 234 5678" inputMode="tel" autoComplete="tel"
            value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      )}
      <div>
        <label className="label" htmlFor="pw">Password</label>
        <div className="relative">
          <input id="pw" type={showPassword ? "text" : "password"} className="field" style={{ paddingRight: 56 }}
            placeholder={authTab === "signup" ? "8+ characters" : "Your password"}
            autoComplete={authTab === "signup" ? "new-password" : "current-password"}
            value={password} onChange={(e) => setPassword(e.target.value)} required minLength={authTab === "signup" ? 8 : undefined} />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold underline"
            style={{ color: PINE }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      {authTab === "login" && (
        <Link href="/forgot-password" className="inline-block text-[13px] font-semibold underline" style={{ color: PINE }}>Forgot password?</Link>
      )}
      {error && <p className="text-[13px] font-medium" style={{ color: RED }}>{error}</p>}
      <Btn primary className="w-full !py-3.5" type="submit" disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>
        {loading ? "Please wait…" : authTab === "signup" ? (role === "artisan" ? "Create account & start verification" : "Create account") : "Log in"}
      </Btn>
      <p className="text-[12px]" style={{ color: MUTED }}>
        By continuing you agree to the Terms and{" "}
        <Link href="/privacy" className="underline font-semibold" style={{ color: PINE }}>Privacy Policy</Link>. We verify identities to keep both sides safe.
      </p>
    </form>
  );
}
