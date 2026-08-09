"use client";

import Link from "next/link";
import { Tick } from "@/components/ui";
import { BRASS, BRASS_SOFT, FOREST, INK, MUTED, PINE } from "@/lib/theme";
import { timeOfDayGreeting } from "@/lib/greeting";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { useDashboard } from "./_hooks/useDashboard";
import CreateProfileForm from "./_components/CreateProfileForm";
import BookingRequests from "./_components/BookingRequests";
import ProfileCard from "./_components/ProfileCard";
import GoodsSection from "./_components/GoodsSection";
import CustomerBookings from "./_components/CustomerBookings";

export default function DashboardPage() {
  const { user } = useCurrentUser();
  const { profile, bookings, ownArtisanProfileId, reload } = useDashboard();

  const requests = ownArtisanProfileId ? bookings.filter((b) => b.artisanProfileId === ownArtisanProfileId) : [];
  const newCount = requests.filter((r) => r.status === "pending").length;
  const myBookings = user ? bookings.filter((b) => b.customerId === user.id) : [];

  const stats = profile
    ? [
        { l: "Trust Score", v: String(profile.trustScore), dark: true },
        { l: "Jobs completed", v: String(profile.jobsCompleted) },
        { l: "Rating", v: profile.rating != null ? Number(profile.rating).toFixed(1) : "—" },
        { l: "Response time", v: profile.responseMinutes != null ? `${profile.responseMinutes} min` : "—" },
      ]
    : [];

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Artisan dashboard</p>
          <h1 className="disp font-bold mt-1" style={{ fontSize: "clamp(1.7rem,4vw,2.6rem)" }}>
            {timeOfDayGreeting()}{user ? `, ${user.fullName.split(" ")[0]}` : ""}{" "}
            <span className="text-base font-normal" style={{ color: MUTED }}>
              {user?.verificationStatus === "verified" && <>· Verified<Tick /></>}
            </span>
          </h1>
        </div>
        {profile && newCount > 0 && (
          <span className="text-[13px] font-semibold px-3 py-1.5 rounded-full" style={{ background: BRASS_SOFT, color: FOREST, border: `1px solid ${BRASS}66` }}>
            {newCount} new request{newCount === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {user && (
        <div className="mt-6">
          <CustomerBookings bookings={myBookings} onChanged={reload} />
        </div>
      )}

      {profile === undefined && <p className="mt-6 text-[14px]" style={{ color: MUTED }}>Loading…</p>}

      {profile === null && user?.verificationStatus !== "verified" && (
        <div className="card soft p-6 mt-6">
          <h2 className="disp font-bold text-[17px]">Verify your identity first</h2>
          <p className="text-[14px] mt-2" style={{ color: MUTED }}>
            You need a verified A-Pass before you can create an artisan profile.{" "}
            <Link href="/account" className="underline font-semibold" style={{ color: PINE }}>Verify from Account &amp; settings</Link>.
          </p>
        </div>
      )}

      {profile === null && user?.verificationStatus === "verified" && (
        <div className="mt-6">
          <CreateProfileForm onCreated={reload} />
        </div>
      )}

      {profile && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {stats.map((s) => (
              <div key={s.l} className="card soft p-4" style={s.dark ? { background: FOREST, borderColor: FOREST } : {}}>
                <p className="text-[12px] font-medium" style={{ color: s.dark ? "#ffffff99" : MUTED }}>{s.l}</p>
                <p className="disp font-bold mt-1" style={{ fontSize: "1.9rem", color: s.dark ? BRASS_SOFT : INK }}>{s.v}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-5 mt-6 items-start">
            <BookingRequests requests={requests} onChanged={reload} />

            <ProfileCard profile={profile} onChanged={reload} />
          </div>

          <div className="mt-6">
            <GoodsSection />
          </div>
        </>
      )}
    </main>
  );
}
