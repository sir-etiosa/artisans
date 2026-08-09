"use client";

import { useState } from "react";
import Tick from "./Tick";
import { MUTED, PINE } from "@/lib/theme";

const INITIAL_VISIBLE = 8;

// Home page "Popular near you" tiles and the /goods category filter both
// use this — collapsed to a manageable grid by default, expandable to the
// full list, same tile markup either way.
export default function CategoryTileGrid({ categories, onSelect, countLabel = "verified" }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? categories : categories.slice(0, INITIAL_VISIBLE);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {visible.map((c) => (
          <button key={c.label} onClick={() => onSelect(c.label)} className="hoverable card p-4 text-left">
            <p className="font-semibold text-[15px]">{c.label}</p>
            <p className="text-[13px] mt-1" style={{ color: MUTED }}>{c.count} {countLabel}<Tick /></p>
          </button>
        ))}
      </div>
      {categories.length > INITIAL_VISIBLE && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-[13px] font-semibold underline mt-3"
          style={{ color: PINE }}
        >
          {expanded ? "Show less" : `Show all ${categories.length}`}
        </button>
      )}
    </div>
  );
}
