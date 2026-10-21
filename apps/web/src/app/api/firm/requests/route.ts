import { prisma } from "@dugun38/db";
import { requireRole } from "@/lib/auth";
import { ok, fail, handleAuthError } from "@/lib/api";

// Firmaya uygun açık talepler + firmanın mevcut teklifi (mobil "Gelen Talepler").
export async function GET() {
  try {
    const user = await requireRole("FIRM");
    const firm = await prisma.firmProfile.findUnique({
      where: { userId: user.id },
      include: { districts: { select: { districtSlug: true } } },
    });
    if (!firm) return fail("Önce firma profilinizi oluşturun", 400);

    const districtSlugs = firm.districts.map((d) => d.districtSlug);
    const requests = await prisma.offerRequest.findMany({
      where: { categorySlug: firm.categorySlug, districtSlug: { in: districtSlugs }, status: { in: ["OPEN", "MATCHED"] } },
      orderBy: { createdAt: "desc" },
      include: { offers: { where: { firmId: firm.id }, select: { price: true, status: true } } },
    });

    return ok({
      requests: requests.map((r) => ({
        id: r.id,
        districtSlug: r.districtSlug,
        guests: r.guests,
        eventDate: r.eventDate,
        budget: r.budget,
        note: r.note,
        myOffer: r.offers[0] ? { price: r.offers[0].price, status: r.offers[0].status } : null,
      })),
    });
  } catch (e) {
    return handleAuthError(e);
  }
}
