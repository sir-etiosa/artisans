"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Btn } from "@/components/ui";
import { MUTED, PINE } from "@/lib/theme";
import StepIndicator from "./_components/StepIndicator";
import ArtisanHeader from "./_components/ArtisanHeader";
import JobDetailsStep from "./_components/JobDetailsStep";
import ScheduleStep from "./_components/ScheduleStep";
import EscrowStep from "./_components/EscrowStep";

export default function BookPage() {
  const { id } = useParams();
  const router = useRouter();
  const [sel, setSel] = useState(undefined);
  const [step, setStep] = useState(1);
  const [job, setJob] = useState({ desc: "", date: "", time: "10:00", addr: "" });
  const [amountNaira, setAmountNaira] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);
  const [balanceArt, setBalanceArt] = useState(undefined);

  useEffect(() => {
    fetch("/api/wallet/balance")
      .then((res) => (res.ok ? res.json() : { balanceArt: null }))
      .then((data) => setBalanceArt(data.balanceArt));
  }, []);

  useEffect(() => {
    fetch(`/api/artisans/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setSel(data?.artisan ?? null);
        // Prefill from the artisan's advertised rate as a starting guess —
        // still editable, since the real agreed price is what the fee is
        // computed from, not the advertised rate text.
        const digits = data?.artisan?.rate?.replace(/[^0-9]/g, "");
        if (digits) setAmountNaira(digits);
      });
  }, [id]);

  if (sel === undefined) {
    return <main className="max-w-2xl mx-auto px-4 md:px-8 pt-16 text-center"><p style={{ color: MUTED }}>Loading…</p></main>;
  }

  if (!sel) {
    return (
      <main className="max-w-2xl mx-auto px-4 md:px-8 pt-16 text-center">
        <p style={{ color: MUTED }}>We couldn’t find that artisan.</p>
        <Btn className="mt-4" onClick={() => router.push("/search")}>Back to results</Btn>
      </main>
    );
  }

  const pay = async () => {
    setPaying(true);
    setPayError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artisanId: sel.id,
          jobDescription: job.desc,
          address: job.addr,
          scheduledDate: job.date,
          scheduledTime: job.time,
          amount: sel.rate?.replace("From ", ""),
          amountNaira,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't create the booking");
      router.push(`/done/${sel.id}?bookingId=${data.booking.id}&date=${encodeURIComponent(job.date)}&time=${encodeURIComponent(job.time)}`);
    } catch (err) {
      setPayError(err.message);
      setPaying(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 md:px-8 pt-8">
      <button onClick={() => router.push(`/artisan/${sel.id}`)} className="text-sm font-semibold underline" style={{ color: PINE }}>← Back to profile</button>

      <StepIndicator step={step} />

      <div className="card soft p-6 md:p-8 mt-5">
        <ArtisanHeader sel={sel} />
        {step === 1 && <JobDetailsStep sel={sel} job={job} setJob={setJob} onContinue={() => setStep(2)} />}
        {step === 2 && <ScheduleStep sel={sel} job={job} setJob={setJob} onBack={() => setStep(1)} onContinue={() => setStep(3)} />}
        {step === 3 && (
          <EscrowStep
            sel={sel} onBack={() => setStep(2)} onPay={pay} paying={paying} error={payError}
            amountNaira={amountNaira} setAmountNaira={setAmountNaira} balanceArt={balanceArt}
          />
        )}
      </div>
    </main>
  );
}
