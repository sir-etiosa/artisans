"use client";

import { CARD, FOREST, LINE } from "@/lib/theme";
import { useAccountMenu } from "./useAccountMenu";
import MenuItem from "./MenuItem";

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function AccountMenu() {
  const { rootRef, open, setOpen, user, logout } = useAccountMenu();

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="disp font-bold flex items-center justify-center"
        style={{ width: 36, height: 36, borderRadius: 999, background: FOREST, color: "#fff" }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        {initials(user?.fullName)}
      </button>

      {open && (
        <div
          role="menu"
          className="card soft"
          style={{ position: "absolute", right: 0, top: 44, width: 220, background: CARD, border: `1px solid ${LINE}`, padding: 6, zIndex: 70 }}
        >
          <MenuItem href="/dashboard" onClick={() => setOpen(false)}>Dashboard</MenuItem>
          <div style={{ height: 1, background: LINE, margin: "4px 0" }} />
          <MenuItem href="/account?tab=profile" onClick={() => setOpen(false)}>Profile</MenuItem>
          <MenuItem href="/account" onClick={() => setOpen(false)}>Account &amp; settings</MenuItem>
          <div style={{ height: 1, background: LINE, margin: "4px 0" }} />
          <MenuItem danger onClick={logout}>Log out</MenuItem>
        </div>
      )}
    </div>
  );
}
