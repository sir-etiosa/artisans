"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Seal, Btn, CredentialCard } from "@/components/ui";
import { ARTISANS } from "@/lib/data";
import { FOREST, INK, CARD, MIST, LINE, MUTED, BRASS, BRASS_SOFT, PINE } from "@/lib/theme";

export default function AuthPage() {
  const router = useRouter();
  const [authTab, setAuthTab] = useState("signup");
  const [role, setRole] = useState("customer");

  const submit = (e) => {
    e.preventDefault();
    router.push(authTab === "signup" ? `/activate?role=${role}` : "/");
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* brand panel */}
      <section className="hidden lg:flex flex-col justify-between p-12" style={{ background: FOREST, color: "#fff" }}>
        <div className="flex items-center gap-2.5">
          <Seal size={36} />
          <span className="disp font-bold text-xl">The Artisans</span>
        </div>
        <div className="max-w-md">
          <p className="eyebrow">Verified skill, on demand</p>
          <h1 className="disp font-bold mt-3 leading-[1.05]" style={{ fontSize: "2.9rem" }}>
            Every hand here has a name, an ID, and a track record.
          </h1>
          <p className="mt-4 text-lg" style={{ color: "#ffffffcc" }}>
            12,000+ electricians, tailors, developers, and photographers — government-ID verified, publicly rated, paid through escrow.
          </p>
          <div className="mt-8" style={{ maxWidth: 380 }}>
            <CredentialCard a={ARTISANS[0]} compact />
          </div>
        </div>
        <p className="text-[13px]" style={{ color: "#ffffff80" }}>Lagos · Abuja · Port Harcourt · Ibadan</p>
      </section>

      {/* form panel */}
      <section className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full fade" style={{ maxWidth: 420 }}>
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Seal size={32} />
            <span className="disp font-bold text-lg">The Artisans</span>
          </div>

          {/* tabs */}
          <div className="flex p-1 rounded-full" style={{ background: MIST }} role="tablist" aria-label="Sign up or log in">
            {[["signup", "Create account"], ["login", "Log in"]].map(([k, l]) => (
              <button key={k} role="tab" aria-selected={authTab === k} onClick={() => setAuthTab(k)}
                className="btn flex-1 py-2 text-sm font-semibold"
                style={{ borderRadius: 999, background: authTab === k ? CARD : "transparent", color: authTab === k ? INK : MUTED, boxShadow: authTab === k ? "0 1px 3px rgba(15,37,89,.12)" : "none" }}>
                {l}
              </button>
            ))}
          </div>

          <h2 className="disp font-bold text-3xl mt-8">
            {authTab === "signup" ? "Join The Artisans" : "Welcome back"}
          </h2>
          <p className="mt-1.5" style={{ color: MUTED }}>
            {authTab === "signup" ? "Two minutes now, a lifetime of not asking your cousin for “a guy.”" : "Your bookings and chats are where you left them."}
          </p>

          {/* role choice */}
          {authTab === "signup" && (
            <div className="grid grid-cols-2 gap-3 mt-6" role="radiogroup" aria-label="Account type">
              {[
                ["customer", "I need artisans", "Search, book, pay in escrow"],
                ["artisan", "I am an artisan", "Get verified, get booked"],
              ].map(([k, t, d]) => (
                <button key={k} role="radio" aria-checked={role === k} onClick={() => setRole(k)}
                  className="hoverable text-left p-4 rounded-xl"
                  style={{ background: CARD, border: `1.5px solid ${role === k ? FOREST : LINE}`, boxShadow: role === k ? `0 0 0 3px ${MIST}` : "none" }}>
                  <p className="font-semibold text-[15px]">{t}</p>
                  <p className="text-[13px] mt-0.5" style={{ color: MUTED }}>{d}</p>
                </button>
              ))}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={submit}>
            {authTab === "signup" && (
              <div>
                <label className="label" htmlFor="name">Full name</label>
                <input id="name" className="field" placeholder="Richard Okonkwo" autoComplete="name" />
              </div>
            )}
            <div>
              <label className="label" htmlFor="phone">Phone number</label>
              <input id="phone" className="field" placeholder="+234 801 234 5678" inputMode="tel" autoComplete="tel" />
            </div>
            <div>
              <label className="label" htmlFor="pw">Password</label>
              <input id="pw" type="password" className="field" placeholder={authTab === "signup" ? "8+ characters" : "Your password"} autoComplete={authTab === "signup" ? "new-password" : "current-password"} />
            </div>
            {authTab === "login" && (
              <button type="button" className="text-[13px] font-semibold underline" style={{ color: PINE }}>Forgot password?</button>
            )}
            <Btn primary className="w-full !py-3.5" type="submit">
              {authTab === "signup" ? (role === "artisan" ? "Create account & start verification" : "Create account") : "Log in"}
            </Btn>
          </form>

          {authTab === "signup" && role === "artisan" && (
            <div className="mt-5 p-4 rounded-xl text-[13px]" style={{ background: BRASS_SOFT, border: `1px solid ${BRASS}55`, color: FOREST }}>
              <p className="font-semibold">Next: verification (free, ~5 min)</p>
              <p className="mt-1" style={{ color: MUTED }}>① Phone & email → ② Government ID → ③ Selfie match → ④ NIN/BVN. You appear in search only after all four clear.</p>
            </div>
          )}

          <p className="text-[12px] mt-6" style={{ color: MUTED }}>
            By continuing you agree to the Terms and Privacy Policy. We verify identities to keep both sides safe.
          </p>
          <button onClick={() => router.push("/")} className="text-[13px] font-semibold underline mt-4" style={{ color: PINE }}>
            Skip for now — just browse →
          </button>
        </div>
      </section>
    </main>
  );
}
