"use client";

import { useState } from "react";
import { Btn } from "@/components/ui";
import { RED, PINE } from "@/lib/theme";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card soft p-6">
      <h2 className="disp font-bold text-[17px]">Change password</h2>
      <form className="mt-4 space-y-4" onSubmit={submit}>
        <div>
          <label className="label" htmlFor="current">Current password</label>
          <input id="current" type="password" className="field" autoComplete="current-password"
            value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="new">New password</label>
          <input id="new" type="password" className="field" placeholder="8+ characters" autoComplete="new-password"
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
        </div>
        {error && <p className="text-[13px] font-medium" style={{ color: RED }}>{error}</p>}
        {success && <p className="text-[13px] font-medium" style={{ color: PINE }}>Password updated.</p>}
        <Btn primary type="submit" disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>
          {loading ? "Updating…" : "Update password"}
        </Btn>
      </form>
    </section>
  );
}
