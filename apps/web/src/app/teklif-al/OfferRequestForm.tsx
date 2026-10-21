"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, DISTRICTS } from "@dugun38/core";

export function OfferRequestForm({ defaultCategory }: { defaultCategory: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ matchedCount: number } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      category: fd.get("category"),
      district: fd.get("district"),
      guests: fd.get("guests") || undefined,
      eventDate: fd.get("eventDate"),
      budget: fd.get("budget") || undefined,
      note: fd.get("note") || undefined,
    };
    const res = await fetch("/api/offer-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Talep oluşturulamadı");
      return;
    }
    setResult({ matchedCount: data.matchedCount });
  }

  if (result) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl">✅</div>
        <h2 className="text-xl font-bold text-ink mt-3">Talebiniz alındı!</h2>
        <p className="text-muted mt-2">
          {result.matchedCount > 0
            ? `${result.matchedCount} uygun firmaya bildirildi. Teklifler geldikçe "Tekliflerim" sayfasında yan yana göreceksiniz.`
            : "Şu an bu kriterlere uygun firma bulunamadı, ama talebiniz kaydedildi. Uygun firma eklendiğinde bildirilir."}
        </p>
        <div className="flex gap-3 justify-center mt-5">
          <button onClick={() => router.push("/hesabim/tekliflerim")} className="btn btn-primary">Tekliflerime git</button>
          <button onClick={() => setResult(null)} className="btn btn-outline">Yeni talep</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <L label="Kategori *">
          <select name="category" required defaultValue={defaultCategory} className="input">
            <option value="">Seçin</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
            ))}
          </select>
        </L>
        <L label="İlçe *">
          <select name="district" required className="input">
            <option value="">Seçin</option>
            {DISTRICTS.map((d) => (
              <option key={d.slug} value={d.slug}>{d.name}</option>
            ))}
          </select>
        </L>
        <L label="Kişi sayısı">
          <input name="guests" type="number" min={1} className="input" placeholder="örn. 400" />
        </L>
        <L label="Düğün / etkinlik tarihi *">
          <input name="eventDate" type="date" required className="input" />
        </L>
      </div>
      <L label="Bütçe (₺) — opsiyonel">
        <input name="budget" type="number" min={0} className="input" placeholder="örn. 350000" />
      </L>
      <L label="Not — firmalara iletmek istedikleriniz">
        <textarea name="note" rows={3} className="input" placeholder="Örn. Cumartesi akşamı, açık büfe menü, canlı müzik olsun." />
      </L>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>}

      <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-60">
        {loading ? "Gönderiliyor…" : "Teklif Talebini Gönder"}
      </button>
      <p className="text-xs text-muted text-center">Telefon numaranız teklifi kabul edip rezervasyon yapana kadar firmalarla paylaşılmaz.</p>
    </form>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink mb-1">{label}</span>
      {children}
    </label>
  );
}
