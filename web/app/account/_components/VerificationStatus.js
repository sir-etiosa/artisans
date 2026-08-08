"use client";

import { useState } from "react";
import { MUTED, PINE, RED, FOREST } from "@/lib/theme";

const LABELS = {
  not_connected: "Not verified",
  verified: "Verified",
  frozen: "Frozen",
  error: "Check failed",
  unknown: "Unknown",
};

const COLORS = {
  verified: FOREST,
  frozen: RED,
  error: RED,
};

export default function VerificationStatus({ status, checkedAt, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const verify = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/verification/verify", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      onUpdate(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const label = LABELS[status] || LABELS.not_connected;
  const color = COLORS[status];

  return (
    <div className="flex justify-between items-start py-3">
      <span className="text-[13px] pt-0.5" style={{ color: MUTED }}>Verification status</span>
      <div className="text-right">
        <div className="text-[13px] font-medium" style={color ? { color } : undefined}>
          {label}
          {checkedAt && status !== "not_connected" && (
            <span className="font-normal" style={{ color: MUTED }}> · {new Date(checkedAt).toLocaleDateString()}</span>
          )}
        </div>
        {status !== "verified" && (
          <button
            onClick={verify}
            disabled={loading}
            className="text-[12px] font-semibold underline mt-1"
            style={{ color: PINE, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Verifying…" : "Verify identity"}
          </button>
        )}
        {error && <div className="text-[11px] mt-1" style={{ color: RED }}>{error}</div>}
      </div>
    </div>
  );
}
