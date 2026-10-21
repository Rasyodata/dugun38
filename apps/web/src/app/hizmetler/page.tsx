import Link from "next/link";
import { SERVICE_CATEGORIES } from "@dugun38/core";

export const metadata = { title: "Hizmetler" };

export default function HizmetlerPage() {
  return (
    <div className="container-x py-10">
      <div className="max-w-3xl">
        <span className="badge bg-brand-50 text-brand-700 mb-4">Kayseri · 16 ilçe</span>
        <h1 className="text-3xl font-bold text-ink">Düğün Hizmetleri</h1>
        <p className="text-muted leading-relaxed mt-2">
          Gelinlikten fotoğrafçıya, müzikten süslemeye; düğününüz için ihtiyaç duyduğunuz
          tüm hizmetleri Kayseri&apos;deki firmalardan tek formla karşılaştırın.
        </p>
      </div>

      <h2 className="text-xl font-bold text-ink mt-8 mb-2">Hizmet kategorileri</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {SERVICE_CATEGORIES.map((c) => (
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

      <div className="mt-8">
        <Link href="/teklif-al" className="btn btn-primary">Tüm hizmetlerden teklif al</Link>
      </div>
    </div>
  );
}
