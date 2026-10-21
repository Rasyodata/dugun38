"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Photo { id: string; url: string }

export function PhotoUploader({ initial }: { initial: Photo[] }) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/firm/media", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) { setError((await res.json()).error ?? "Yüklenemedi"); return; }
    const data = await res.json();
    setPhotos((p) => [...p, { id: data.id, url: data.url }]);
    router.refresh();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/firm/media/${id}`, { method: "DELETE" });
    if (res.ok) { setPhotos((p) => p.filter((x) => x.id !== id)); router.refresh(); }
  }

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {photos.map((p) => (
          <div key={p.id} className="relative group aspect-square rounded-lg overflow-hidden border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" className="w-full h-full object-cover" />
            <button onClick={() => remove(p.id)} className="absolute top-1 right-1 bg-white/90 rounded-full w-6 h-6 text-sm leading-none shadow hover:bg-red-50 text-red-600" aria-label="Sil">✕</button>
          </div>
        ))}
        <label className="aspect-square rounded-lg border-2 border-dashed border-line flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 text-muted text-sm">
          <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={uploading} />
          <span className="text-2xl">{uploading ? "⏳" : "＋"}</span>
          <span className="text-xs mt-1">{uploading ? "Yükleniyor" : "Fotoğraf ekle"}</span>
        </label>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      <p className="text-xs text-muted mt-2">En fazla 12 fotoğraf · 8 MB'a kadar · otomatik küçültülür</p>
    </div>
  );
}
