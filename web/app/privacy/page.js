import Link from "next/link";
import { MUTED, LINE, PINE } from "@/lib/theme";

function Section({ title, children }) {
  return (
    <section className="mt-6">
      <h2 className="disp font-bold text-[16px]">{title}</h2>
      <p className="mt-2 text-[14px] leading-relaxed" style={{ color: MUTED }}>{children}</p>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 md:px-8 pt-8 pb-16">
      <Link href="/" className="text-sm font-semibold underline" style={{ color: PINE }}>← Back</Link>
      <h1 className="disp font-bold mt-3" style={{ fontSize: "clamp(1.7rem,4vw,2.2rem)" }}>Privacy Policy</h1>
      <p className="mt-2 text-[13px]" style={{ color: MUTED }}>Last updated 2026-08-08</p>

      <div className="mt-6 pt-2" style={{ borderTop: `1px solid ${LINE}` }}>
        <Section title="What we collect">
          Your name, email, and phone number when you create an account. If you choose to verify your identity,
          we also collect your government ID type, ID number, and a photo of the ID.
        </Section>

        <Section title="Why we collect it">
          Identity details are used only to verify who you are, through our verification partner Cleanverse and,
          for a final check, a brief human review on our side. We don&apos;t use this information for advertising or
          share it with anyone outside of what&apos;s needed to verify your identity.
        </Section>

        <Section title="How it's stored">
          ID numbers and photos are encrypted before they&apos;re stored, and only accessible to the small team
          handling verification review. Your ID number is also hashed to make sure the same document can&apos;t be
          used to verify more than one account.
        </Section>

        <Section title="How long we keep it">
          We keep your data only for as long as your account is active. If you delete your account, all of your
          data — including any ID details submitted for verification — is permanently deleted within 7 days.
        </Section>

        <Section title="Your rights">
          You can ask us what we hold about you, or ask us to delete your account and data, at any time.
        </Section>
      </div>
    </main>
  );
}
