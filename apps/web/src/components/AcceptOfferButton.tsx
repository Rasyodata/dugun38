"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatTRY, calcDeposit } from "@dugun38/core";

export function AcceptOfferButton({ offerId, price }: { offerId: string; price: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/offers/${offerId}/accept`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "İşlem başarısız");
      return;
    }
    router.push(`/hesabim/rezervasyon/${data.reservationId}`);
    router.refresh();
  }

  return (
    <div>
      <button onClick={accept} disabled={loading} className="btn btn-primary w-full text-sm disabled:opacity-60">
        {loading ? "…" : "Kabul et ve rezerve et"}
      </button>
      <p className="text-xs text-muted mt-1 text-center">Kaparo: {formatTRY(calcDeposit(price))} (%20)</p>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
