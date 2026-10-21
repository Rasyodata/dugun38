import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@dugun38/db";
import { getCurrentUser } from "@/lib/auth";
import { FirmCard, type FirmCardData } from "@/components/FirmCard";

export const metadata = { title: "Favorilerim" };

export default async function FavorilerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  if (user.role !== "COUPLE") redirect("/");

  const favs = await prisma.favorite.findMany({
    where: { coupleId: user.id },
    orderBy: { createdAt: "desc" },
    include: { firm: { include: { districts: { select: { districtSlug: true } }, media: { take: 1, orderBy: { sort: "asc" } } } } },
  });

  const firms: FirmCardData[] = favs.map((f) => ({
    slug: f.firm.slug,
    businessName: f.firm.businessName,
    categorySlug: f.firm.categorySlug,
    about: f.firm.about,
    minPrice: f.firm.minPrice,
    pricePerGuest: f.firm.pricePerGuest,
    capacity: f.firm.capacity,
    ratingAvg: f.firm.ratingAvg,
    ratingCount: f.firm.ratingCount,
    showcase: f.firm.showcase,
    responseMedianMin: f.firm.responseMedianMin,
    districts: f.firm.districts.map((d) => d.districtSlug),
    imageUrl: f.firm.media[0]?.url ?? null,
  }));

  return (
    <div className="container-x py-8">
      <h1 className="text-2xl font-bold text-ink">Favorilerim</h1>
      {firms.length === 0 ? (
        <div className="card p-10 text-center mt-6">
          <p className="text-muted">Henüz favori firmanız yok. Firma sayfalarında 🤍 ile ekleyebilirsiniz.</p>
          <Link href="/arama" className="btn btn-primary mt-4 inline-flex">Firmaları keşfet</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
          {firms.map((f) => <FirmCard key={f.slug} firm={f} />)}
        </div>
      )}
    </div>
  );
}
