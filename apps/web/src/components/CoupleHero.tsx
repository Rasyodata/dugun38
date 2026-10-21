"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function daysUntil(dateIso: string): number {
  const d = new Date(dateIso);
  const now = new Date();
  d.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}

export function CoupleHero({
  name,
  weddingDate,
  progress,
}: {
  name: string;
  weddingDate: string | null;
  progress: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(weddingDate ? weddingDate.slice(0, 10) : "");
  const [saving, setSaving] = useState(false);

  const monogram = name
    .split(/[&+]/)
    .map((p) => p.trim().charAt(0).toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join(" & ");

  const days = weddingDate ? daysUntil(weddingDate) : null;

  async function save() {
    setSaving(true);
    await fetch("/api/couple/wedding-date", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  return (
    <div className="relative overflow-hidden rounded-2xl text-white shadow-xl"
      style={{ background: "linear-gradient(135deg, #a61d48 0%, #c62c5a 45%, #dc4772 100%)" }}>
      {/* Dekoratif halkalar */}
      <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full border-2 border-white/15" />
      <div className="absolute -right-2 top-8 w-36 h-36 rounded-full border-2 border-white/10" />
      <div className="absolute right-6 bottom-4 text-white/10 text-7xl select-none">💍</div>

      <div className="relative p-6 md:p-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 rounded-full px-3 py-1 backdrop-blur">
          ✨ Çiftimize Özel
        </span>

        <div className="flex items-center gap-4 mt-4">
          <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur flex items-center justify-center font-serif text-lg font-bold border border-white/30">
            {monogram || "💕"}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">Hoş geldiniz, {name} 💐</h1>
            <p className="text-white/85 text-sm mt-0.5">Hayatınızın en özel gününe birlikte hazırlanıyoruz.</p>
          </div>
        </div>

        {/* Geri sayım / tarih */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            {days !== null && days >= 0 ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-extrabold">{days}</span>
                  <span className="text-white/85">gün kaldı 💍</span>
                </div>
                <button onClick={() => setEditing((e) => !e)} className="text-xs text-white/70 underline mt-1">
                  {new Date(weddingDate!).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} · düzenle
                </button>
              </div>
            ) : days !== null && days < 0 ? (
              <div>
                <span className="text-xl font-bold">Tebrikler, evlendiniz! 🎉</span>
                <button onClick={() => setEditing(true)} className="block text-xs text-white/70 underline mt-1">tarihi güncelle</button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="btn bg-white/20 hover:bg-white/30 text-white backdrop-blur text-sm">
                📅 Düğün tarihinizi ekleyin — geri sayım başlasın
              </button>
            )}

            {editing && (
              <div className="flex items-center gap-2 mt-3">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="rounded-lg px-3 py-2 text-ink text-sm" />
                <button onClick={save} disabled={saving} className="btn bg-white text-brand-700 text-sm disabled:opacity-60">
                  {saving ? "…" : "Kaydet"}
                </button>
              </div>
            )}
          </div>

          {/* Plan ilerlemesi */}
          <div className="bg-white/15 backdrop-blur rounded-xl p-3 min-w-[180px]">
            <div className="flex justify-between text-xs text-white/85 mb-1">
              <span>Düğün planınız</span>
              <span className="font-bold">%{progress}</span>
            </div>
            <div className="h-2 bg-white/25 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[11px] text-white/75 mt-1.5">
              {progress >= 100 ? "Her şey hazır! 🎊" : "Harika gidiyorsunuz ✨"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
