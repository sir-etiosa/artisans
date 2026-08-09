"use client";

import { useState } from "react";
import { Btn } from "@/components/ui";
import { MUTED, PINE, RED, FOREST, BRASS, LINE } from "@/lib/theme";

const LABELS = {
  not_connected: "Not verified",
  pending: "Pending review",
  verified: "Verified",
  frozen: "Frozen",
  error: "Check failed",
  unknown: "Unknown",
};

const COLORS = { pending: BRASS, verified: FOREST, frozen: RED, error: RED };

const ID_TYPES = [
  { value: "ID_CARD", label: "National ID card" },
  { value: "PASSPORT", label: "Passport" },
  { value: "DRIVER_LICENSE", label: "Driver's license" },
  { value: "RESIDENCE_PERMIT", label: "Residence permit" },
];

export default function VerificationStatus({ status, checkedAt, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [idType, setIdType] = useState("ID_CARD");
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [issuingCountryISO2, setIssuingCountryISO2] = useState("");
  const [idImage, setIdImage] = useState(null);
  const [idImagePreview, setIdImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // "frozen" means a staff review rejected this — don't let the account
  // self-serve a resubmit around that; it has to go through support.
  // "pending" means it's already in the review queue — resubmitting would
  // just create a second copy of the same thing.
  const locked = status === "verified" || status === "frozen" || status === "pending";
  const label = LABELS[status] || LABELS.not_connected;
  const color = COLORS[status];

  const pickImage = (e) => {
    const file = e.target.files?.[0] || null;
    setIdImage(file);
    setIdImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body = new FormData();
      body.set("idType", idType);
      body.set("fullName", fullName);
      body.set("idNumber", idNumber);
      body.set("issuingCountryISO2", issuingCountryISO2);
      if (idImage) body.set("idImage", idImage);

      const res = await fetch("/api/verification/verify", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      onUpdate(data.user);
      setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-3">
      <div className="flex justify-between items-start">
        <span className="text-[13px] pt-0.5" style={{ color: MUTED }}>Verification status</span>
        <div className="text-right">
          <div className="text-[13px] font-medium" style={color ? { color } : undefined}>
            {label}
            {checkedAt && status !== "not_connected" && (
              <span className="font-normal" style={{ color: MUTED }}> · {new Date(checkedAt).toLocaleDateString()}</span>
            )}
          </div>
          {!locked && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="text-[12px] font-semibold underline mt-1"
              style={{ color: PINE }}
            >
              {open ? "Cancel" : "Verify identity"}
            </button>
          )}
        </div>
      </div>

      {!locked && open && (
        <form onSubmit={submit} className="mt-3 space-y-3 text-left" style={{ borderTop: `1px solid ${LINE}`, paddingTop: 12 }}>
          <div>
            <label className="label" htmlFor="idType">ID type</label>
            <select id="idType" className="field" value={idType} onChange={(e) => setIdType(e.target.value)} required>
              {ID_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="fullName">Full name (as on ID)</label>
            <input id="fullName" className="field" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="idNumber">ID number</label>
            <input id="idNumber" className="field" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="issuingCountryISO2">Issuing country (2-letter code)</label>
            <input
              id="issuingCountryISO2"
              className="field"
              maxLength={2}
              placeholder="NG"
              value={issuingCountryISO2}
              onChange={(e) => setIssuingCountryISO2(e.target.value.toUpperCase())}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="idImage">Photo of the ID</label>
            <input id="idImage" type="file" accept="image/jpeg,image/png,image/webp" className="field" onChange={pickImage} required />
            {idImagePreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={idImagePreview} alt="Selected ID preview" className="mt-2 rounded-lg" style={{ maxHeight: 140, border: `1px solid ${LINE}` }} />
            )}
          </div>
          {error && <p className="text-[13px] font-medium" style={{ color: RED }}>{error}</p>}
          <Btn primary small type="submit" disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>
            {loading ? "Verifying…" : "Submit & verify"}
          </Btn>
        </form>
      )}
    </div>
  );
}
