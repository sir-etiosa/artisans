"use client";

import { useState } from "react";
import { Btn } from "@/components/ui";
import { MUTED, RED } from "@/lib/theme";

export default function ProfileCard({ profile, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [trade, setTrade] = useState(profile.trade || "");
  const [tagline, setTagline] = useState(profile.tagline || "");
  const [area, setArea] = useState(profile.area || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [yearsExperience, setYearsExperience] = useState(profile.yearsExperience ?? "");
  const [rate, setRate] = useState(profile.rate || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/artisan-profiles/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trade, tagline, area, bio, yearsExperience: yearsExperience || undefined, rate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't save changes");
      setEditing(false);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete your artisan profile? Customers won't be able to find or book you until you create a new one.")) return;
    setLoading(true);
    const res = await fetch("/api/artisan-profiles/me", { method: "DELETE" });
    if (res.ok) onChanged();
    setLoading(false);
  };

  if (editing) {
    return (
      <section className="card soft p-6">
        <h2 className="disp font-bold text-[17px]">Edit your profile</h2>
        <form onSubmit={save} className="mt-4 space-y-3">
          <div>
            <label className="label" htmlFor="edit-trade">Trade / skill</label>
            <input id="edit-trade" className="field" value={trade} onChange={(e) => setTrade(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="edit-tagline">One-line tagline</label>
            <input id="edit-tagline" className="field" value={tagline} onChange={(e) => setTagline(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="edit-area">Area</label>
            <input id="edit-area" className="field" value={area} onChange={(e) => setArea(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="edit-bio">Bio</label>
            <textarea id="edit-bio" rows={3} className="field" value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="edit-years">Years of experience</label>
              <input id="edit-years" type="number" min="0" max="60" className="field" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="edit-rate">Rate</label>
              <input id="edit-rate" className="field" value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
          </div>
          {error && <p className="text-[13px] font-medium" style={{ color: RED }}>{error}</p>}
          <div className="flex gap-2">
            <Btn primary small type="submit" disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>
              {loading ? "Saving…" : "Save changes"}
            </Btn>
            <Btn small type="button" disabled={loading} onClick={() => setEditing(false)}>Cancel</Btn>
          </div>
        </form>
      </section>
    );
  }

  return (
    <section className="card soft p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="disp font-bold text-[17px]">Your profile</h2>
        <div className="flex gap-2 shrink-0">
          <Btn small onClick={() => setEditing(true)}>Edit</Btn>
          <Btn small disabled={loading} onClick={remove} style={{ color: RED }}>Delete</Btn>
        </div>
      </div>
      <dl className="mt-4 space-y-2.5 text-[13px]">
        <div className="flex justify-between"><dt style={{ color: MUTED }}>Trade</dt><dd className="font-medium">{profile.trade}</dd></div>
        <div className="flex justify-between"><dt style={{ color: MUTED }}>Tagline</dt><dd className="font-medium">{profile.tagline || "—"}</dd></div>
        <div className="flex justify-between"><dt style={{ color: MUTED }}>Area</dt><dd className="font-medium">{profile.area || "—"}</dd></div>
        <div className="flex justify-between"><dt style={{ color: MUTED }}>Rate</dt><dd className="font-medium">{profile.rate || "—"}</dd></div>
        <div className="flex justify-between"><dt style={{ color: MUTED }}>Years experience</dt><dd className="font-medium">{profile.yearsExperience ?? "—"}</dd></div>
        <div className="flex justify-between"><dt style={{ color: MUTED }}>Location on file</dt><dd className="font-medium">{profile.lat != null ? "Yes" : "Not set"}</dd></div>
      </dl>
    </section>
  );
}
