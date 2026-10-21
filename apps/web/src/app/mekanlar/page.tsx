import Link from "next/link";
import { VENUE_CATEGORIES, DISTRICTS } from "@dugun38/core";

export const metadata = { title: "Mekanlar" };

export default function MekanlarPage() {
  return (
    <div className="container-x py-10">
      <div className="max-w-3xl">
        <span className="badge bg-brand-50 text-brand-700 mb-4">Kayseri · 16 ilçe</span>
        <h1 className="text-3xl font-bold text-ink">Düğün Mekanları</h1>
        <p className="text-muted leading-relaxed mt-2">
          Düğün salonundan kır düğününe, kına mekanından otel düğününe; Kayseri&apos;nin her
          ilçesinde size uygun mekanı bulun ve tek formla teklif alın.
        </p>
      </div>

      <h2 className="text-xl font-bold text-ink mt-8 mb-2">Mekan kategorileri</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {VENUE_CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/kategori/${c.slug}`}
            className="card p-4 text-center hover:border-brand-400 transition"
          >
            <div className="text-3xl">{c.icon}</div>
            <div className="text-sm font-medium mt-2 text-ink">{c.name}</div>
          </Link>
        ))}
      </div>

      <h2 className="text-xl font-bold text-ink mt-8 mb-2">İlçeye göre düğün salonları</h2>
      <p className="text-muted leading-relaxed mt-2">
        Kayseri&apos;nin 16 ilçesinde düğün salonlarını keşfedin.
      </p>
      <div className="flex flex-wrap gap-2 mt-4">
        {DISTRICTS.map((d) => (
          <Link
            key={d.slug}
            href={`/kategori/dugun-salonu/${d.slug}`}
            className="badge bg-brand-50 text-brand-700 hover:bg-brand-100 transition"
          >
            {d.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
