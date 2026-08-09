"use client";

import { useEffect, useState } from "react";
import { Btn } from "@/components/ui";
import { BRASS, BRASS_SOFT, FOREST, LINE, MUTED, RED } from "@/lib/theme";
import PostGoodsForm from "./PostGoodsForm";

function EditListingForm({ listing, onSaved, onCancel }) {
  const [name, setName] = useState(listing.name);
  const [category, setCategory] = useState(listing.category);
  const [priceNaira, setPriceNaira] = useState(listing.priceNaira);
  const [isNew, setIsNew] = useState(listing.condition === "new");
  const [description, setDescription] = useState(listing.description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/goods/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, priceNaira, condition: isNew ? "new" : null, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't save changes");
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={save} className="p-4 rounded-xl space-y-2.5" style={{ border: `1px solid ${LINE}` }}>
      <input className="field" value={name} onChange={(e) => setName(e.target.value)} required />
      <div className="grid grid-cols-2 gap-2">
        <input className="field" value={category} onChange={(e) => setCategory(e.target.value)} required />
        <input type="number" min="1" className="field" value={priceNaira} onChange={(e) => setPriceNaira(e.target.value)} required />
      </div>
      <label className="flex items-center gap-2 text-[13px] font-medium">
        <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
        This item is new
      </label>
      <textarea rows={2} className="field" value={description} onChange={(e) => setDescription(e.target.value)} />
      {error && <p className="text-[13px] font-medium" style={{ color: RED }}>{error}</p>}
      <div className="flex gap-2">
        <Btn primary small type="submit" disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>{loading ? "Saving…" : "Save"}</Btn>
        <Btn small type="button" onClick={onCancel}>Cancel</Btn>
      </div>
    </form>
  );
}

export default function GoodsSection() {
  const [listings, setListings] = useState(undefined);
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    fetch("/api/goods/mine")
      .then((res) => (res.ok ? res.json() : { goods: [] }))
      .then((data) => setListings(data.goods));
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm("Delete this listing?")) return;
    setBusyId(id);
    const res = await fetch(`/api/goods/${id}`, { method: "DELETE" });
    if (res.ok) load();
    setBusyId(null);
  };

  return (
    <section className="card soft p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="disp font-bold text-[17px]">Your goods listings</h2>
        {!posting && <Btn small primary onClick={() => setPosting(true)}>Post an item</Btn>}
      </div>

      {posting && (
        <div className="mt-4">
          <PostGoodsForm onCreated={() => { setPosting(false); load(); }} onCancel={() => setPosting(false)} />
        </div>
      )}

      {listings === undefined && <p className="text-[13px] mt-3" style={{ color: MUTED }}>Loading…</p>}
      {listings && listings.length === 0 && !posting && (
        <p className="text-[13px] mt-3" style={{ color: MUTED }}>You haven&apos;t posted any goods yet.</p>
      )}

      <div className="mt-4 space-y-3">
        {listings?.map((g) =>
          editingId === g.id ? (
            <EditListingForm key={g.id} listing={g} onSaved={() => { setEditingId(null); load(); }} onCancel={() => setEditingId(null)} />
          ) : (
            <div key={g.id} className="p-4 rounded-xl flex flex-wrap gap-3 justify-between items-center" style={{ border: `1px solid ${LINE}` }}>
              <div className="flex items-center gap-3 min-w-0">
                {g.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g.images[0]} alt="" className="shrink-0 object-cover" style={{ width: 48, height: 48, borderRadius: 10, border: `1px solid ${LINE}` }} />
                ) : (
                  <div className="shrink-0" style={{ width: 48, height: 48, borderRadius: 10, background: LINE }} />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-[14px] truncate">
                    {g.name}{" "}
                    {g.condition === "new" && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full align-middle" style={{ background: BRASS_SOFT, color: FOREST, border: `1px solid ${BRASS}66` }}>NEW</span>
                    )}
                  </p>
                  <p className="text-[13px]" style={{ color: MUTED }}>{g.category} · ₦{g.priceNaira.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Btn small onClick={() => setEditingId(g.id)}>Edit</Btn>
                <Btn small disabled={busyId === g.id} onClick={() => remove(g.id)} style={{ color: RED }}>Delete</Btn>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}
