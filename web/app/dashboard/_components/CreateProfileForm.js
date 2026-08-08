"use client";

import { useState } from "react";
import { Btn } from "@/components/ui";
import { MUTED, RED } from "@/lib/theme";
import { useGeolocation } from "@/lib/geo/useGeolocation";

export default function CreateProfileForm({ onCreated }) {
  const { coords, status: geoStatus } = useGeolocation();
  const [trade, setTrade] = useState("");
  const [tagline, setTagline] = useState("");
  const [area, setArea] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [rate, setRate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/artisan-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trade, tagline, area, bio,
          yearsExperience: yearsExperience || undefined,
          rate,
          lat: coords?.lat,
          lng: coords?.lng,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't create profile");
      onCreated(data.profile);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card soft p-6">
      <h2 className="disp font-bold text-[17px]">Set up your artisan profile</h2>
      <p className="text-[13px] mt-1" style={{ color: MUTED }}>Tell customers what you do — this is what shows up in search.</p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <div>
          <label className="label" htmlFor="trade">Trade / skill</label>
          <input id="trade" className="field" placeholder="e.g. Electrician, Tailor, Music Producer"
            value={trade} onChange={(e) => setTrade(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="tagline">One-line tagline</label>
          <input id="tagline" className="field" placeholder="e.g. Fast, reliable home wiring"
            value={tagline} onChange={(e) => setTagline(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="area">Area</label>
          <input id="area" className="field" placeholder="e.g. Surulere, Lagos" value={area} onChange={(e) => setArea(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="bio">Bio</label>
          <textarea id="bio" rows={3} className="field" placeholder="A few lines about your experience"
            value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="years">Years of experience</label>
            <input id="years" type="number" min="0" max="60" className="field" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="rate">Rate</label>
            <input id="rate" className="field" placeholder="From ₦15,000" value={rate} onChange={(e) => setRate(e.target.value)} />
          </div>
        </div>
        <p className="text-[12px]" style={{ color: MUTED }}>
          {geoStatus === "granted"
            ? "Using your real location so customers can see distance to you."
            : "Enable location so customers can see real distance to you."}
        </p>
        {error && <p className="text-[13px] font-medium" style={{ color: RED }}>{error}</p>}
        <Btn primary type="submit" disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>
          {loading ? "Creating…" : "Create profile"}
        </Btn>
      </form>
    </section>
  );
}
