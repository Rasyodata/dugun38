import { getFirmBySlug } from "@/lib/firms";
import { ok, fail } from "@/lib/api";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const firm = await getFirmBySlug(slug);
  if (!firm || firm.user.deletedAt) return fail("Firma bulunamadı", 404);

  return ok({
    slug: firm.slug,
    businessName: firm.businessName,
    categorySlug: firm.categorySlug,
    about: firm.about,
    minPrice: firm.minPrice,
    maxPrice: firm.maxPrice,
    capacity: firm.capacity,
    pricePerGuest: firm.pricePerGuest,
    ratingAvg: firm.ratingAvg,
    ratingCount: firm.ratingCount,
    showcase: firm.showcase,
    verified: firm.verified,
    responseMedianMin: firm.responseMedianMin,
    districts: firm.districts.map((d) => d.districtSlug),
    media: firm.media.map((m) => ({ url: m.url, alt: m.alt })),
    packages: firm.packages.map((p) => ({ name: p.name, price: p.price, description: p.description })),
    reviews: firm.reviews.map((r) => ({ name: r.couple.name, rating: r.rating, body: r.body })),
  });
}
