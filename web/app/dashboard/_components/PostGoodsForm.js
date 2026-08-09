"use client";

import { useState } from "react";
import { Btn } from "@/components/ui";
import { LINE, MUTED, RED } from "@/lib/theme";
import { useGeolocation } from "@/lib/geo/useGeolocation";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MIN_IMAGES = 2;
const MAX_IMAGES = 6;

export default function PostGoodsForm({ onCreated, onCancel }) {
  const { coords } = useGeolocation();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [priceNaira, setPriceNaira] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]); // [{url, uploading}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addImages = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    setError(null);

    const room = MAX_IMAGES - images.length;
    if (files.length > room) {
      setError(`You can add at most ${MAX_IMAGES} images`);
    }
    const toUpload = files.slice(0, room);

    for (const file of toUpload) {
      if (file.size > MAX_IMAGE_BYTES) {
        setError(`${file.name} is over 2MB`);
        continue;
      }
      const placeholder = { url: null, uploading: true, key: crypto.randomUUID() };
      setImages((prev) => [...prev, placeholder]);

      const body = new FormData();
      body.set("image", file);
      try {
        const res = await fetch("/api/goods/upload-image", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        setImages((prev) => prev.map((img) => (img.key === placeholder.key ? { ...img, url: data.url, uploading: false } : img)));
      } catch (err) {
        setError(err.message);
        setImages((prev) => prev.filter((img) => img.key !== placeholder.key));
      }
    }
  };

  const removeImage = (key) => setImages((prev) => prev.filter((img) => img.key !== key));

  const readyImages = images.filter((img) => img.url).map((img) => img.url);
  const stillUploading = images.some((img) => img.uploading);

  const submit = async (e) => {
    e.preventDefault();
    if (readyImages.length < MIN_IMAGES) {
      setError(`Add at least ${MIN_IMAGES} images`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/goods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, category, priceNaira,
          condition: isNew ? "new" : undefined,
          description,
          images: readyImages,
          lat: coords?.lat,
          lng: coords?.lng,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't post this item");
      onCreated(data.listing);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card soft p-6">
      <h2 className="disp font-bold text-[17px]">Post an item</h2>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <div>
          <label className="label" htmlFor="goods-name">Item name</label>
          <input id="goods-name" className="field" placeholder="e.g. Bosch angle grinder"
            value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="goods-category">Category</label>
            <input id="goods-category" className="field" placeholder="e.g. Power tools"
              value={category} onChange={(e) => setCategory(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="goods-price">Price (₦)</label>
            <input id="goods-price" type="number" min="1" className="field"
              value={priceNaira} onChange={(e) => setPriceNaira(e.target.value)} required />
          </div>
        </div>
        <label className="flex items-center gap-2 text-[13px] font-medium">
          <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
          This item is new
        </label>
        <div>
          <label className="label" htmlFor="goods-description">Description</label>
          <textarea id="goods-description" rows={3} className="field" placeholder="Condition details, what's included…"
            value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <label className="label">Images ({readyImages.length}/{MAX_IMAGES}, min {MIN_IMAGES}, up to 2MB each)</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {images.map((img) => (
              <div key={img.key} className="relative" style={{ width: 64, height: 64 }}>
                {img.uploading ? (
                  <div className="w-full h-full flex items-center justify-center text-[11px] rounded-lg" style={{ background: LINE }}>…</div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt="" className="w-full h-full object-cover rounded-lg" style={{ border: `1px solid ${LINE}` }} />
                )}
                <button type="button" onClick={() => removeImage(img.key)}
                  className="absolute -top-1.5 -right-1.5 text-[10px] font-bold rounded-full flex items-center justify-center"
                  style={{ width: 18, height: 18, background: RED, color: "#fff" }}>✕</button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <label className="flex items-center justify-center rounded-lg cursor-pointer text-[11px]"
                style={{ width: 64, height: 64, border: `1px dashed ${LINE}`, color: MUTED }}>
                + Add
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addImages} className="sr-only" />
              </label>
            )}
          </div>
        </div>

        {error && <p className="text-[13px] font-medium" style={{ color: RED }}>{error}</p>}
        <div className="flex gap-2">
          <Btn primary small type="submit" disabled={loading || stillUploading} style={{ opacity: loading || stillUploading ? 0.6 : 1 }}>
            {loading ? "Posting…" : "Post item"}
          </Btn>
          {onCancel && <Btn small type="button" onClick={onCancel}>Cancel</Btn>}
        </div>
      </form>
    </section>
  );
}
