"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CATEGORIES, DISTRICTS, SORT_OPTIONS } from "@dugun38/core";

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <aside className="card p-5 space-y-5 h-fit lg:sticky lg:top-20">
      <div>
        <h3 className="font-semibold text-sm mb-2">Kategori</h3>
        <select className="input" value={sp.get("category") ?? ""} onChange={(e) => update("category", e.target.value)}>
          <option value="">Tümü</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-2">İlçe / Hizmet bölgesi</h3>
        <select className="input" value={sp.get("district") ?? ""} onChange={(e) => update("district", e.target.value)}>
          <option value="">Tüm Kayseri</option>
          {DISTRICTS.map((d) => (
            <option key={d.slug} value={d.slug}>{d.name}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-2">Kişi sayısı (min. kapasite)</h3>
        <input
          type="number"
          min={1}
          className="input"
          placeholder="örn. 400"
          defaultValue={sp.get("guests") ?? ""}
          onBlur={(e) => update("guests", e.target.value)}
        />
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-2">Fiyat aralığı (₺)</h3>
        <div className="flex gap-2">
          <input type="number" min={0} className="input" placeholder="En az" defaultValue={sp.get("priceMin") ?? ""} onBlur={(e) => update("priceMin", e.target.value)} />
          <input type="number" min={0} className="input" placeholder="En çok" defaultValue={sp.get("priceMax") ?? ""} onBlur={(e) => update("priceMax", e.target.value)} />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-2">Sıralama</h3>
        <select className="input" value={sp.get("sort") ?? "relevance"} onChange={(e) => update("sort", e.target.value)}>
          {SORT_OPTIONS.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </div>

      <button onClick={() => router.push(pathname)} className="btn btn-outline w-full text-sm">
        Filtreleri temizle
      </button>
    </aside>
  );
}
