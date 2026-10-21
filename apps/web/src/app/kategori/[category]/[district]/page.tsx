import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORY_BY_SLUG, DISTRICT_BY_SLUG, DISTRICTS, formatTRY } from "@dugun38/core";
import { searchFirms } from "@/lib/firms";
import { FirmCard } from "@/components/FirmCard";

// Not: Sayfalar istek anında sunucuda render edilir (dinamik). Derleme anı
// ön-üretimi (generateStaticParams) kaldırıldı — build hafif, SEO için tam HTML +
// metadata yine üretilir, 320 URL sitemap.xml'de listelenir.

export async function generateMetadata({ params }: PageProps<"/kategori/[category]/[district]">): Promise<Metadata> {
  const { category, district } = await params;
  const cat = CATEGORY_BY_SLUG[category];
  const dist = DISTRICT_BY_SLUG[district];
  if (!cat || !dist) return {};
  return {
    title: `${dist.name} ${cat.plural} — Fiyatları ve Yorumları`,
    description: `${dist.name}, Kayseri'de ${cat.plural.toLowerCase()}. ${dist.name} ${cat.name.toLowerCase()} fiyatları, kapasiteleri ve gerçek çift yorumları. Tek formla teklif al.`,
    alternates: { canonical: `/kategori/${cat.slug}/${dist.slug}` },
  };
}

export default async function KategoriIlcePage({ params }: PageProps<"/kategori/[category]/[district]">) {
  const { category, district } = await params;
  const cat = CATEGORY_BY_SLUG[category];
  const dist = DISTRICT_BY_SLUG[district];
  if (!cat || !dist) notFound();

  const { firms, total } = await searchFirms({ category: cat.slug, district: dist.slug, sort: "relevance", pageSize: 24 });

  return (
    <div className="container-x py-8">
      <nav className="text-sm text-muted mb-3">
        <Link href="/" className="hover:text-brand-700">Anasayfa</Link> ›{" "}
        <Link href={`/kategori/${cat.slug}`} className="hover:text-brand-700">Kayseri {cat.name}</Link> ›{" "}
        <span className="text-ink">{dist.name}</span>
      </nav>

      <h1 className="text-3xl font-bold text-ink">{dist.name} {cat.plural}</h1>
      <p className="text-muted mt-2 max-w-2xl">
        {dist.name}, Kayseri'de {cat.plural.toLowerCase()}.
        {cat.kind === "VENUE" && (
          <> Bölgede ortalama kişi başı menü <strong>{formatTRY(dist.avgPerGuest)}</strong>, ortalama kapasite <strong>{dist.avgCapacity} kişi</strong>.</>
        )}{" "}
        Fiyatları karşılaştır, teklif al.
      </p>

      <p className="text-sm text-muted mt-8 mb-4">{total} firma</p>
      {firms.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-muted">
            {dist.name} için {cat.name.toLowerCase()} kategorisinde henüz firma eklenmedi.
            {!dist.central && " Bu ilçede 'yerel derinlik' fırsatı var — firmanızı ilk ekleyen siz olun."}
          </p>
          <div className="flex gap-3 justify-center mt-4">
            <Link href={`/kategori/${cat.slug}`} className="btn btn-outline">Tüm Kayseri'de gör</Link>
            <Link href="/teklif-al" className="btn btn-primary">Teklif al</Link>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {firms.map((f) => (
            <FirmCard key={f.slug} firm={f} />
          ))}
        </div>
      )}

      {/* Komşu ilçeler */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold text-muted mb-2">Diğer ilçelerde {cat.name}</h2>
        <div className="flex flex-wrap gap-2">
          {DISTRICTS.filter((d) => d.slug !== dist.slug).map((d) => (
            <Link key={d.slug} href={`/kategori/${cat.slug}/${d.slug}`} className="badge bg-white border border-line hover:border-brand-400 text-ink">
              {d.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
