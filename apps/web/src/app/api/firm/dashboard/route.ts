import { prisma } from "@dugun38/db";
import { requireRole } from "@/lib/auth";
import { ok, handleAuthError } from "@/lib/api";

// Firma paneli özeti (mobil dashboard).
export async function GET() {
  try {
    const user = await requireRole("FIRM");
    const firm = await prisma.firmProfile.findUnique({
      where: { userId: user.id },
      include: { districts: { select: { districtSlug: true } } },
    });
    if (!firm) return ok({ hasProfile: false });

    const districtSlugs = firm.districts.map((d) => d.districtSlug);
    const [openRequests, offersSent, reservations] = await Promise.all([
      prisma.offerRequest.count({
        where: { categorySlug: firm.categorySlug, status: { in: ["OPEN", "MATCHED"] }, districtSlug: { in: districtSlugs } },
      }),
      prisma.offer.count({ where: { firmId: firm.id } }),
      prisma.reservation.findMany({ where: { firmId: firm.id }, select: { status: true, totalAmount: true, commissionAmount: true } }),
    ]);
    const netEarned = reservations
      .filter((r) => r.status === "COMPLETED")
      .reduce((s, r) => s + (r.totalAmount - r.commissionAmount), 0);

    return ok({
      hasProfile: true,
      businessName: firm.businessName,
      slug: firm.slug,
      categorySlug: firm.categorySlug,
      ratingAvg: firm.ratingAvg,
      ratingCount: firm.ratingCount,
      districts: districtSlugs,
      openRequests,
      offersSent,
      reservations: reservations.length,
      netEarned,
    });
  } catch (e) {
    return handleAuthError(e);
  }
}
