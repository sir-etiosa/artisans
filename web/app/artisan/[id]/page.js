"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Btn } from "@/components/ui";
import { MUTED, PINE } from "@/lib/theme";
import ProfileSidebar from "./_components/ProfileSidebar";
import AboutSection from "./_components/AboutSection";
import CertificationsSection from "./_components/CertificationsSection";
import PortfolioSection from "./_components/PortfolioSection";
import ReviewsSection from "./_components/ReviewsSection";

export default function ArtisanProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [sel, setSel] = useState(undefined); // undefined = loading, null = not found

  useEffect(() => {
    fetch(`/api/artisans/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setSel(data?.artisan ?? null));
  }, [id]);

  if (sel === undefined) {
    return <main className="max-w-3xl mx-auto px-4 md:px-8 pt-16 text-center"><p style={{ color: MUTED }}>Loading…</p></main>;
  }

  if (!sel) {
    return (
      <main className="max-w-3xl mx-auto px-4 md:px-8 pt-16 text-center">
        <p style={{ color: MUTED }}>We couldn’t find that artisan.</p>
        <Btn className="mt-4" onClick={() => router.push("/search")}>Back to results</Btn>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
      <button onClick={() => router.push("/search")} className="text-sm font-semibold underline" style={{ color: PINE }}>← Back to results</button>

      <div className="grid lg:grid-cols-3 gap-6 mt-4 items-start">
        <ProfileSidebar sel={sel} />
        <div className="lg:col-span-2 space-y-5">
          <AboutSection sel={sel} />
          {sel.certs?.length > 0 && <CertificationsSection sel={sel} />}
          {sel.portfolio?.length > 0 && <PortfolioSection sel={sel} />}
          {sel.reviews?.length > 0 && <ReviewsSection sel={sel} />}
        </div>
      </div>
    </main>
  );
}
