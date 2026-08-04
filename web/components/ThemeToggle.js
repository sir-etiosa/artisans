"use client";

import { useState } from "react";
import { CARD, LINE, INK } from "@/lib/theme";

export default function ThemeToggle({ floating = false }) {
  const [dark, setDark] = useState(false);

  const toggle = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="btn flex items-center justify-center"
      style={{
        ...(floating ? { position: "fixed", top: 16, right: 16, zIndex: 60, boxShadow: "0 4px 12px rgba(15,37,89,.18)" } : {}),
        width: 36, height: 36, borderRadius: 999, background: CARD, border: `1px solid ${LINE}`, color: INK, fontSize: 16,
      }}
    >
      {dark ? "☀" : "☾"}
    </button>
  );
}
