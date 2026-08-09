"use client";

import { Suspense } from "react";
import { Logo } from "@/components/ui";
import { useAuthForm } from "./_hooks/useAuthForm";
import BrandPanel from "./_components/BrandPanel";
import AuthTabs from "./_components/AuthTabs";
import RoleChoice from "./_components/RoleChoice";
import AuthForm from "./_components/AuthForm";
import VerificationNote from "./_components/VerificationNote";
import { MUTED } from "@/lib/theme";

function AuthInner() {
  const form = useAuthForm();

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <BrandPanel />
      <section className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full fade" style={{ maxWidth: 420 }}>
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Logo size={32} />
            <span className="disp font-bold text-lg">The Artisans</span>
          </div>

          <AuthTabs authTab={form.authTab} onChange={form.changeTab} />

          <h2 className="disp font-bold text-3xl mt-8">
            {form.authTab === "signup" ? "Join The Artisans" : "Welcome back"}
          </h2>
          <p className="mt-1.5" style={{ color: MUTED }}>
            {form.authTab === "signup" ? "Online marketplace for services" : "Your bookings and chats are where you left them."}
          </p>

          {form.authTab === "signup" && <RoleChoice role={form.role} onChange={form.setRole} />}

          <AuthForm form={form} />

          {form.authTab === "signup" && form.role === "artisan" && <VerificationNote />}
        </div>
      </section>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthInner />
    </Suspense>
  );
}
