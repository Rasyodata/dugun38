import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORIES, CATEGORY_BY_SLUG, DISTRICTS } from "@dugun38/core";
import { searchFirms } from "@/lib/firms";
import { FirmCard } from "@/components/FirmCard";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/kategori/[category]">): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORY_BY_SLUG[category];
  if (!cat) return {};
  return {
    title: `Kayseri ${cat.plural}`,
    description: `Kayseri'de ${cat.plural.toLowerCase()} — fiyatlar, yorumlar ve teklif. 16 ilçede ${cat.blurb} için en kapsamlı liste Düğün38'de.`,
    alternates: { canonical: `/kategori/${cat.slug}` },
  };
}

export default async function KategoriPage({ params }: PageProps<"/kategori/[category]">) {
  const { category } = await params;
  const cat = CATEGORY_BY_SLUG[category];
  if (!cat) notFound();

  const { firms, total } = await searchFirms({ category: cat.slug, sort: "relevance", pageSize: 24 });

  return (
    <div className="container-x py-8">
      <nav className="text-sm text-muted mb-3">
        <Link href="/" className="hover:text-brand-700">Anasayfa</Link> ›{" "}
        <Link href={cat.kind === "VENUE" ? "/mekanlar" : "/hizmetler"} className="hover:text-brand-700">
          {cat.kind === "VENUE" ? "Mekanlar" : "Hizmetler"}
        </Link> › <span className="text-ink">{cat.name}</span>
      </nav>

      <h1 className="text-3xl font-bold text-ink">{cat.icon} Kayseri {cat.plural}</h1>
      <p className="text-muted mt-2 max-w-2xl">
        Kayseri'nin 16 ilçesinde {cat.plural.toLowerCase()}. Fiyatları ve yorumları karşılaştır,
        tek formla teklif al, Güvenli Kaparo ile güvenle rezerve et.
      </p>

      {/* İlçe bağlantıları — SEO iç linkleme (kategori × ilçe) */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-muted mb-2">İlçeye göre {cat.name}</h2>
        <div className="flex flex-wrap gap-2">
          {DISTRICTS.map((d) => (
            <Link
              key={d.slug}
              href={`/kategori/${cat.slug}/${d.slug}`}
              className="badge bg-white border border-line hover:border-brand-400 text-ink"
            >
              {d.name}
            </Link>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted mt-8 mb-4">{total} firma listeleniyor</p>
      {firms.length === 0 ? (
        <EmptyState cat={cat.name} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {firms.map((f) => (
            <FirmCard key={f.slug} firm={f} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ cat }: { cat: string }) {
  return (
    <div className="card p-10 text-center">
      <p className="text-muted">Bu kategoride ({cat}) henüz firma eklenmedi.</p>
      <Link href="/teklif-al" className="btn btn-primary mt-4 inline-flex">Yine de teklif al</Link>
    </div>
  );
}
