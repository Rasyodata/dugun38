import type { MetadataRoute } from "next";
import { CATEGORIES, DISTRICTS } from "@dugun38/core";
import { prisma } from "@dugun38/db";

const BASE = process.env.SITE_URL ?? process.env.RENDER_EXTERNAL_URL ?? "https://dugun38.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ["", "/mekanlar", "/hizmetler", "/teklif-al", "/asistan", "/guvenli-kaparo", "/kvkk", "/gizlilik", "/cerez", "/kullanim-kosullari"].map(
    (p) => ({ url: `${BASE}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 }),
  );

  const categoryPages = CATEGORIES.map((c) => ({
    url: `${BASE}/kategori/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // 320 kategori × ilçe sayfası
  const districtPages = CATEGORIES.flatMap((c) =>
    DISTRICTS.map((d) => ({
      url: `${BASE}/kategori/${c.slug}/${d.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  );

  // DB henüz hazır değilse (örn. build anı) sitemap yine üretilsin — firmalar boş geçilir.
  let firms: { slug: string }[] = [];
  try {
    firms = await prisma.firmProfile.findMany({ where: { user: { deletedAt: null } }, select: { slug: true } });
  } catch {
    firms = [];
  }
  const firmPages = firms.map((f) => ({ url: `${BASE}/firma/${f.slug}`, changeFrequency: "weekly" as const, priority: 0.7 }));

  return [...staticPages, ...categoryPages, ...districtPages, ...firmPages];
}
