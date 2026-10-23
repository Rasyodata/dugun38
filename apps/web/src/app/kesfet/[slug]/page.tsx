import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORY_BY_SLUG } from "@dugun38/core";
import { ARTICLES, ARTICLE_BY_SLUG, type Block } from "../articles";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLE_BY_SLUG[slug];
  if (!article) return {};
  return {
    title: `${article.title} | Duviora Keşfet`,
    description: article.excerpt,
    alternates: { canonical: `/kesfet/${article.slug}` },
  };
}

function renderBlock(block: Block, index: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2 key={index} className="text-2xl font-bold text-ink mt-8 mb-3">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={index} className="text-lg font-semibold text-ink mt-6 mb-2">
          {block.text}
        </h3>
      );
    case "li":
      return (
        <li key={index} className="text-muted leading-relaxed mt-2 ml-5 list-disc">
          {block.text}
        </li>
      );
    case "p":
    default:
      return (
        <p key={index} className="text-muted leading-relaxed mt-3">
          {block.text}
        </p>
      );
  }
}

export default async function KesfetArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = ARTICLE_BY_SLUG[slug];
  if (!article) notFound();

  const cat = CATEGORY_BY_SLUG[article.category];

  return (
    <div className="container-x py-10">
      <nav className="text-sm text-muted mb-3">
        <Link href="/" className="hover:text-brand-700">
          Anasayfa
        </Link>{" "}
        ›{" "}
        <Link href="/kesfet" className="hover:text-brand-700">
          Keşfet
        </Link>{" "}
        › <span className="text-ink">{article.title}</span>
      </nav>

      <article className="max-w-3xl">
        {cat && (
          <Link href={`/kategori/${cat.slug}`} className="badge bg-brand-50 text-brand-700">
            {cat.icon} {cat.name}
          </Link>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-ink mt-3">{article.title}</h1>
        <p className="text-muted leading-relaxed mt-3">{article.excerpt}</p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.cover}
          alt={article.title}
          className="w-full h-64 object-cover rounded-xl bg-brand-50 mt-6"
        />

        <div className="mt-6">{article.body.map((block, i) => renderBlock(block, i))}</div>
      </article>

      {/* İlgili CTA */}
      <div className="card p-6 mt-10 max-w-3xl">
        <h2 className="text-lg font-semibold text-ink">Bu konuda ilerlemeye hazır mısınız?</h2>
        <p className="text-muted leading-relaxed mt-3">
          Kayseri'deki firmalardan karşılaştırmalı teklif alın, Güvenli Kaparo ile güvenle rezerve edin.
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          <Link href="/teklif-al" className="btn btn-primary">
            Ücretsiz Teklif Al
          </Link>
          {cat && (
            <Link href={`/kategori/${cat.slug}`} className="btn btn-outline">
              Kayseri {cat.plural}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
