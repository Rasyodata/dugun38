"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, DISTRICTS, CATEGORY_BY_SLUG } from "@dugun38/core";

interface Initial {
  businessName: string;
  categorySlug: string;
  about: string;
  districts: string[];
  capacity?: number;
  pricePerGuest?: number;
  minPrice?: number;
  maxPrice?: number;
  phone: string;
  address: string;
}

export function FirmProfileForm({ initial, isNew }: { initial: Initial; isNew: boolean }) {
  const router = useRouter();
  const [category, setCategory] = useState(initial.categorySlug);
  const [districts, setDistricts] = useState<string[]>(initial.districts);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isVenue = category ? CATEGORY_BY_SLUG[category]?.kind === "VENUE" : false;

  function toggleDistrict(slug: string) {
    setDistricts((d) => (d.includes(slug) ? d.filter((x) => x !== slug) : [...d, slug]));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!category) return setError("Kategori seçin");
    if (districts.length === 0) return setError("En az bir hizmet bölgesi seçin");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      businessName: fd.get("businessName"),
      categorySlug: category,
      about: fd.get("about") || undefined,
      districts,
      phone: fd.get("phone") || undefined,
      address: fd.get("address") || undefined,
    };
    if (isVenue) {
      body.capacity = fd.get("capacity") || undefined;
      body.pricePerGuest = fd.get("pricePerGuest") || undefined;
    } else {
      body.minPrice = fd.get("minPrice") || undefined;
      body.maxPrice = fd.get("maxPrice") || undefined;
    }
    const res = await fetch("/api/firm/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Kaydedilemedi");
    router.push("/firma-paneli");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <L label="Firma adı *">
        <input name="businessName" required defaultValue={initial.businessName} className="input" />
      </L>
      <L label="Kategori *">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input" required>
          <option value="">Seçin</option>
          {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
        </select>
      </L>
      <L label="Hakkında">
        <textarea name="about" rows={3} defaultValue={initial.about} className="input" placeholder="Firmanızı kısaca tanıtın" />
      </L>

      <div>
        <span className="block text-sm font-medium text-ink mb-2">Hizmet bölgeleri * (ilçeler)</span>
        <div className="flex flex-wrap gap-2">
          {DISTRICTS.map((d) => (
            <button
              key={d.slug} type="button" onClick={() => toggleDistrict(d.slug)}
              className={`badge border ${districts.includes(d.slug) ? "bg-brand-600 text-white border-brand-600" : "bg-white border-line text-muted"}`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {isVenue ? (
        <div className="grid grid-cols-2 gap-4">
          <L label="Kapasite (kişi)"><input name="capacity" type="number" min={1} defaultValue={initial.capacity} className="input" /></L>
          <L label="Kişi başı fiyat (₺)"><input name="pricePerGuest" type="number" min={0} defaultValue={initial.pricePerGuest} className="input" /></L>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <L label="En düşük fiyat (₺)"><input name="minPrice" type="number" min={0} defaultValue={initial.minPrice} className="input" /></L>
          <L label="En yüksek fiyat (₺)"><input name="maxPrice" type="number" min={0} defaultValue={initial.maxPrice} className="input" /></L>
        </div>
      )}

      <L label="İletişim telefonu (rezervasyona kadar gizli kalır)">
        <input name="phone" defaultValue={initial.phone} className="input" placeholder="5XX XXX XX XX" />
      </L>
      <L label="Adres">
        <input name="address" defaultValue={initial.address} className="input" />
      </L>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>}
      <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-60">
        {loading ? "Kaydediliyor…" : isNew ? "Profili Oluştur" : "Değişiklikleri Kaydet"}
      </button>
    </form>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-sm font-medium text-ink mb-1">{label}</span>{children}</label>;
}
