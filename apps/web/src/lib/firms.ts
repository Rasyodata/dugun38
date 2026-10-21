import "server-only";
import { prisma, type Prisma } from "@dugun38/db";
import type { FirmCardData } from "@/components/FirmCard";
import type { SortKey } from "@dugun38/core";

export interface FirmQuery {
  category?: string;
  district?: string;
  guests?: number;
  priceMin?: number;
  priceMax?: number;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
}

const orderByMap: Record<SortKey, Prisma.FirmProfileOrderByWithRelationInput[]> = {
  relevance: [{ showcase: "desc" }, { ratingAvg: "desc" }, { ratingCount: "desc" }],
  rating: [{ ratingAvg: "desc" }, { ratingCount: "desc" }],
  price_asc: [{ minPrice: "asc" }],
  price_desc: [{ maxPrice: "desc" }],
  response: [{ responseMedianMin: "asc" }],
};

export async function searchFirms(q: FirmQuery): Promise<{ firms: FirmCardData[]; total: number }> {
  const pageSize = q.pageSize ?? 12;
  const page = Math.max(1, q.page ?? 1);

  const where: Prisma.FirmProfileWhereInput = {
    user: { deletedAt: null },
    ...(q.category ? { categorySlug: q.category } : {}),
    ...(q.district ? { districts: { some: { districtSlug: q.district } } } : {}),
    ...(q.guests ? { OR: [{ capacity: { gte: q.guests } }, { capacity: null }] } : {}),
    ...(q.priceMin != null ? { maxPrice: { gte: q.priceMin } } : {}),
    ...(q.priceMax != null ? { minPrice: { lte: q.priceMax } } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.firmProfile.findMany({
      where,
      orderBy: orderByMap[q.sort ?? "relevance"],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        districts: { select: { districtSlug: true } },
        media: { orderBy: { sort: "asc" }, take: 1 },
        _count: { select: { media: true } },
      },
    }),
    prisma.firmProfile.count({ where }),
  ]);

  return {
    total,
    firms: rows.map((r) => ({
      slug: r.slug,
      businessName: r.businessName,
      categorySlug: r.categorySlug,
      about: r.about,
      minPrice: r.minPrice,
      pricePerGuest: r.pricePerGuest,
      capacity: r.capacity,
      ratingAvg: r.ratingAvg,
      ratingCount: r.ratingCount,
      showcase: r.showcase,
      responseMedianMin: r.responseMedianMin,
      districts: r.districts.map((d) => d.districtSlug),
      imageUrl: r.media[0]?.url ?? null,
      hasVideo: r.hasVideo,
      hasTour360: r.hasTour360,
      photoCount: r._count.media,
    })),
  };
}

/** Kategoriye göre firma sayıları (SEO/landing — dugunbuketi "N Firma"). */
export async function firmCountsByCategory(): Promise<Record<string, number>> {
  const rows = await prisma.firmProfile.groupBy({
    by: ["categorySlug"],
    where: { user: { deletedAt: null } },
    _count: true,
  });
  return Object.fromEntries(rows.map((r) => [r.categorySlug, r._count]));
}

/** İlçeye göre firma sayıları; opsiyonel kategori filtresi. */
export async function firmCountsByDistrict(category?: string): Promise<Record<string, number>> {
  const rows = await prisma.firmDistrict.groupBy({
    by: ["districtSlug"],
    where: {
      firm: { user: { deletedAt: null }, ...(category ? { categorySlug: category } : {}) },
    },
    _count: true,
  });
  return Object.fromEntries(rows.map((r) => [r.districtSlug, r._count]));
}

/** Vitrin / öne çıkan firmalar (ana sayfa). */
export async function featuredFirms(limit = 8): Promise<FirmCardData[]> {
  const { firms } = await searchFirms({ sort: "relevance", pageSize: limit });
  return firms;
}

export async function getFirmBySlug(slug: string) {
  return prisma.firmProfile.findUnique({
    where: { slug },
    include: {
      districts: { select: { districtSlug: true } },
      media: { orderBy: { sort: "asc" } },
      packages: { orderBy: { sort: "asc" } },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { couple: { select: { name: true } } },
      },
      user: { select: { deletedAt: true } },
    },
  });
}
