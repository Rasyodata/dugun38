"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "PENDING_DEPOSIT" | "DEPOSIT_HELD" | "COMPLETED" | "DISPUTED" | "REFUNDED" | "CANCELLED";

export function ReservationActions({ id, status, hasReview }: { id: string; status: Status; hasReview: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDispute, setShowDispute] = useState(false);
  const [showReview, setShowReview] = useState(false);

  async function call(path: string, body?: unknown) {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/reservations/${id}/${path}`, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "İşlem başarısız"); return false; }
    router.refresh();
    return true;
  }

  async function submitReview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservationId: id, rating: fd.get("rating"), body: fd.get("body") || undefined }),
    });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Gönderilemedi"); return; }
    setShowReview(false);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>}

      {status === "PENDING_DEPOSIT" && (
        <button onClick={() => call("deposit")} disabled={loading} className="btn btn-primary w-full disabled:opacity-60">
          {loading ? "…" : "%20 Kaparoyu Öde (Güvenli Kaparo · test)"}
        </button>
      )}

      {status === "DEPOSIT_HELD" && (
        <>
          <button onClick={() => call("complete")} disabled={loading} className="btn btn-primary w-full disabled:opacity-60">
            Hizmeti aldım — kaparoyu firmaya aktar
          </button>
          {!showDispute ? (
            <button onClick={() => setShowDispute(true)} className="btn btn-outline w-full text-sm">Sorun var, itiraz et</button>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); call("dispute", { reason: fd.get("reason") }); }} className="space-y-2">
              <textarea name="reason" required minLength={5} rows={2} className="input" placeholder="Sorunu kısaca açıklayın (admin inceleyecek)" />
              <button type="submit" disabled={loading} className="btn btn-outline w-full text-sm">İtirazı gönder</button>
            </form>
          )}
        </>
      )}

      {status === "COMPLETED" && !hasReview && (
        !showReview ? (
          <button onClick={() => setShowReview(true)} className="btn btn-primary w-full">Firmayı değerlendir</button>
        ) : (
          <form onSubmit={submitReview} className="space-y-2 card p-3">
            <label className="block text-sm font-medium text-ink">Puan
              <select name="rating" className="input mt-1" defaultValue="5">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)} ({n})</option>)}
              </select>
            </label>
            <textarea name="body" rows={3} className="input" placeholder="Deneyiminizi paylaşın" />
            <button type="submit" disabled={loading} className="btn btn-primary w-full text-sm">Yorumu gönder</button>
          </form>
        )
      )}
    </div>
  );
}
