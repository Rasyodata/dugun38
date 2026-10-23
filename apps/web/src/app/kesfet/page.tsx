import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORY_BY_SLUG } from "@dugun38/core";
import { ARTICLES } from "./articles";

export const metadata: Metadata = {
  title: "Düğün Rehberi (Keşfet) | Kayseri Düğün İpuçları",
  description:
    "Kayseri'de düğün planlayanlar için rehber: bütçe, mekan, kına geleneği, yöresel menü ve gelinlik seçimi. Duviora Keşfet köşesinden faydalı içerikler.",
  alternates: { canonical: "/kesfet" },
};

// Keşfet ana sayfasında öne çıkarılan kategoriler.
const FEATURED_CATEGORIES = [
  "dugun-salonu",
  "kir-dugunu",
  "kina-mekani",
  "catering",
  "gelinlik",
  "nisan-mekani",
];

export default function KesfetPage() {
  return (
    <div className="container-x py-10">
      <nav className="text-sm text-muted mb-3">
        <Link href="/" className="hover:text-brand-700">
          Anasayfa
        </Link>{" "}
        › <span className="text-ink">Keşfet</span>
      </nav>

      <span className="badge bg-brand-50 text-brand-700">Keşfet</span>
      <h1 className="text-3xl md:text-4xl font-bold text-ink mt-3">Düğün Rehberi</h1>
      <p className="text-muted leading-relaxed mt-3 max-w-2xl">
        Kayseri'de hayalinizdeki düğünü planlamanız için hazırladığımız rehber içerikler.
        Bütçeden mekana, yöresel geleneklerden gelinlik seçimine kadar faydalı ipuçları bir arada.
      </p>

      {/* Makale kart grid'i */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {ARTICLES.map((a) => (
          <article key={a.slug} className="card p-0 overflow-hidden flex flex-col">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={a.cover}
              alt={a.title}
              className="w-full h-44 object-cover bg-brand-50"
            />
            <div className="p-6 flex flex-col flex-1">
              <h2 className="text-lg font-semibold text-ink leading-snug">{a.title}</h2>
              <p className="text-muted leading-relaxed mt-3 text-sm flex-1">{a.excerpt}</p>
              <Link
                href={`/kesfet/${a.slug}`}
                className="text-brand-700 font-medium mt-4 inline-flex items-center gap-1 hover:text-brand-600"
              >
                Oku →
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Kategoriye göz at */}
      <h2 className="text-2xl font-bold text-ink mt-12 mb-3">Kategoriye göz at</h2>
      <p className="text-muted leading-relaxed">
        Rehberde okuduklarınızı hayata geçirmeye hazır mısınız? Kayseri'deki firmaları kategoriye göre keşfedin.
      </p>
      <div className="flex flex-wrap gap-2 mt-4">
        {FEATURED_CATEGORIES.map((slug) => {
          const cat = CATEGORY_BY_SLUG[slug];
          if (!cat) return null;
          return (
            <Link
              key={slug}
              href={`/kategori/${slug}`}
              className="badge bg-white border border-line hover:border-brand-400 text-ink"
            >
              {cat.icon} {cat.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
