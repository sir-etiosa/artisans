"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ui";
import { MUTED, RED, LINE, MIST, PINE } from "@/lib/theme";

export default function AdminVerificationPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [reviews, setReviews] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.user.adminRole !== "support" && data.user.adminRole !== "full") router.replace("/admin");
        else setAuthorized(true);
      })
      .catch(() => router.replace("/auth"));
  }, [router]);

  const loadReviews = () => {
    fetch("/api/admin/verification-reviews")
      .then((res) => res.json())
      .then((data) => setReviews(data.reviews || []));
  };

  useEffect(() => {
    if (authorized) loadReviews();
  }, [authorized]);

  const openReview = (id) => {
    setSelected(id);
    setDetail(null);
    setNote("");
    setError(null);
    fetch(`/api/admin/verification-reviews/${id}`)
      .then((res) => res.json())
      .then(setDetail);
  };

  const decide = async (decision) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/verification-reviews/${selected}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSelected(null);
      setDetail(null);
      loadReviews();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!authorized) return null;

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-8 pt-8 pb-16">
      <Link href="/admin" className="text-sm font-semibold underline" style={{ color: PINE }}>← Admin</Link>
      <h1 className="disp font-bold mt-3" style={{ fontSize: "clamp(1.7rem,4vw,2.2rem)" }}>Identity review queue</h1>
      <p className="mt-1 text-[14px]" style={{ color: MUTED }}>
        Cleanverse verifies instantly on submission — this is the fraud-check pass afterward. Rejecting freezes the account&apos;s A-Pass.
      </p>

      <div className="grid md:grid-cols-2 gap-5 mt-6">
        <section className="card soft p-4">
          {!reviews ? (
            <p className="text-[13px]" style={{ color: MUTED }}>Loading…</p>
          ) : reviews.length === 0 ? (
            <p className="text-[13px]" style={{ color: MUTED }}>Nothing pending.</p>
          ) : (
            <ul className="space-y-1">
              {reviews.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => openReview(r.id)}
                    className="w-full text-left p-3 rounded-lg text-[13px]"
                    style={{ background: selected === r.id ? MIST : "transparent", border: `1px solid ${LINE}` }}
                  >
                    <div className="font-semibold">{r.userFullName} · {r.userEmail}</div>
                    <div style={{ color: MUTED }}>{r.idType} · {r.issuingCountryIso2} · {new Date(r.createdAt).toLocaleString()}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card soft p-4">
          {!selected ? (
            <p className="text-[13px]" style={{ color: MUTED }}>Select a submission to review.</p>
          ) : !detail ? (
            <p className="text-[13px]" style={{ color: MUTED }}>Loading…</p>
          ) : (
            <div className="space-y-3 text-[13px]">
              <div><span style={{ color: MUTED }}>Account: </span>{detail.user?.fullName} ({detail.user?.email})</div>
              <div><span style={{ color: MUTED }}>Wallet: </span><span style={{ fontFamily: "monospace" }}>{detail.user?.walletAddress}</span></div>
              <div><span style={{ color: MUTED }}>ID type: </span>{detail.review.idType}</div>
              <div><span style={{ color: MUTED }}>Name on ID: </span>{detail.review.fullName}</div>
              <div><span style={{ color: MUTED }}>ID number: </span>{detail.review.idNumber}</div>
              <div><span style={{ color: MUTED }}>Issuing country: </span>{detail.review.issuingCountryIso2}</div>
              <div><span style={{ color: MUTED }}>Cleanverse tier: </span>{detail.review.cleanverseRaw?.tier ?? "—"}</div>
              <div>
                <span style={{ color: MUTED }}>ID photo:</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={detail.review.idImageDataUrl} alt="Submitted ID" className="mt-2 rounded-lg" style={{ maxWidth: "100%", border: `1px solid ${LINE}` }} />
              </div>

              <textarea
                className="field"
                placeholder="Note (optional, recommended for rejection)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
              {error && <p style={{ color: RED }}>{error}</p>}
              <div className="flex gap-2">
                <Btn primary small disabled={busy} onClick={() => decide("approved")}>Approve</Btn>
                <Btn small disabled={busy} style={{ color: RED, border: `1px solid ${RED}` }} onClick={() => decide("rejected")}>
                  Reject &amp; freeze
                </Btn>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
