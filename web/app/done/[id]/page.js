"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Btn, Seal } from "@/components/ui";
import { INK, LINE, MUTED, PAPER } from "@/lib/theme";

function DoneInner() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sel, setSel] = useState(undefined);
  const date = searchParams.get("date");
  const time = searchParams.get("time") || "10:00";
  const bookingId = searchParams.get("bookingId");

  useEffect(() => {
    fetch(`/api/artisans/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setSel(data?.artisan ?? null));
  }, [id]);

  if (sel === undefined) {
    return <main className="max-w-lg mx-auto px-4 md:px-8 pt-16 text-center"><p style={{ color: MUTED }}>Loading…</p></main>;
  }

  if (!sel) {
    return (
      <main className="max-w-lg mx-auto px-4 md:px-8 pt-16 text-center">
        <p style={{ color: MUTED }}>We couldn’t find that booking.</p>
        <Btn className="mt-4" onClick={() => router.push("/")}>Back home</Btn>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 md:px-8 pt-16">
      <div className="card soft p-8 text-center fade">
        <div className="flex justify-center"><Seal size={72} label="BOOKED & IN ESCROW • THE ARTISANS • " /></div>
        <h1 className="disp font-bold mt-5" style={{ fontSize: "2rem" }}>{sel.name.split(" ")[0]} is on it.</h1>
        <p className="mt-2 text-[15px]" style={{ color: MUTED }}>
          Request sent for <b style={{ color: INK }}>{date || "your chosen date"}, {time}</b>. You’ll get a notification the moment {sel.name.split(" ")[0]} accepts — then chat and live tracking open up.
        </p>
        <div className="mt-5 p-4 rounded-xl text-left text-[13px]" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
          <p className="font-semibold">Booking № {bookingId ? bookingId.slice(0, 8).toUpperCase() : "—"}</p>
          <p className="mt-1" style={{ color: MUTED }}>Status: awaiting artisan accept · Escrow: {sel.rate.replace("From ", "")}</p>
        </div>
        <div className="flex justify-center gap-3 mt-7">
          <Btn primary onClick={() => router.push("/")}>Back home</Btn>
          <Btn onClick={() => router.push("/dashboard")}>See artisan side</Btn>
        </div>
      </div>
    </main>
  );
}

export default function DonePage() {
  return (
    <Suspense fallback={null}>
      <DoneInner />
    </Suspense>
  );
}
