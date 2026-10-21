"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatTRY, calcCommission } from "@dugun38/core";

export function SendOfferForm({ requestId, existingPrice }: { requestId: string; existingPrice?: number }) {
  const router = useRouter();
  const [price, setPrice] = useState(existingPrice ? String(existingPrice) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, price, message: fd.get("message") || undefined }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Teklif gönderilemedi"); return; }
    setDone(true);
    router.refresh();
  }

  if (done) return <p className="text-sm text-green-700 bg-green-50 rounded p-2 mt-2">✓ Teklifiniz gönderildi.</p>;

  const p = Number(price) || 0;

  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-2">
      <div className="flex gap-2">
        <input
          type="number" min={1} required value={price} onChange={(e) => setPrice(e.target.value)}
          className="input" placeholder="Teklif tutarı (₺)"
        />
        <button type="submit" disabled={loading} className="btn btn-primary text-sm whitespace-nowrap disabled:opacity-60">
          {loading ? "…" : existingPrice ? "Güncelle" : "Teklif ver"}
        </button>
      </div>
      <input name="message" className="input" placeholder="Kısa mesaj (opsiyonel)" />
      {p > 0 && <p className="text-xs text-muted">Rezervasyon olursa komisyon: {formatTRY(calcCommission(p))} (%2) · Net: {formatTRY(p - calcCommission(p))}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
