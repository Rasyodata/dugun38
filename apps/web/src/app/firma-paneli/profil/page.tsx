import { redirect } from "next/navigation";
import { prisma } from "@dugun38/db";
import { getCurrentUser } from "@/lib/auth";
import { FirmProfileForm } from "./FirmProfileForm";
import { PhotoUploader } from "@/components/PhotoUploader";

export const metadata = { title: "Firma Profili" };

export default async function FirmaProfilPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  if (user.role !== "FIRM") redirect("/");

  const firm = await prisma.firmProfile.findUnique({
    where: { userId: user.id },
    include: { districts: { select: { districtSlug: true } }, media: { orderBy: { sort: "asc" }, select: { id: true, url: true } } },
  });

  const initial = firm
    ? {
        businessName: firm.businessName,
        categorySlug: firm.categorySlug,
        about: firm.about ?? "",
        districts: firm.districts.map((d) => d.districtSlug),
        capacity: firm.capacity ?? undefined,
        pricePerGuest: firm.pricePerGuest ?? undefined,
        minPrice: firm.minPrice ?? undefined,
        maxPrice: firm.maxPrice ?? undefined,
        phone: firm.publicPhone ?? "",
        address: firm.address ?? "",
      }
    : { businessName: user.name, categorySlug: "", about: "", districts: [] as string[], phone: "", address: "" };

  return (
    <div className="container-x py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-ink">{firm ? "Profili düzenle" : "Firma profilini oluştur"}</h1>
      <p className="text-muted text-sm mt-1">Ne kadar eksiksiz olursa o kadar çok talep alırsınız. Ücretsiz.</p>
      {firm && (
        <div className="card p-6 mt-6">
          <h2 className="font-semibold text-ink mb-3">📷 Fotoğraflar</h2>
          <PhotoUploader initial={firm.media} />
        </div>
      )}

      <div className="card p-6 mt-6">
        <FirmProfileForm initial={initial} isNew={!firm} />
      </div>
    </div>
  );
}
