import { prisma } from "@dugun38/db";
import { requireRole } from "@/lib/auth";
import { ok, handleAuthError } from "@/lib/api";

// Çiftin rezervasyonları (mobil liste).
export async function GET() {
  try {
    const user = await requireRole("COUPLE");
    const reservations = await prisma.reservation.findMany({
      where: { coupleId: user.id },
      orderBy: { createdAt: "desc" },
      include: { firm: { select: { businessName: true, slug: true } }, review: { select: { id: true } } },
    });
    return ok({
      reservations: reservations.map((r) => ({
        id: r.id,
        firmName: r.firm.businessName,
        firmSlug: r.firm.slug,
        totalAmount: r.totalAmount,
        depositAmount: r.depositAmount,
        eventDate: r.eventDate,
        status: r.status,
        hasReview: Boolean(r.review),
      })),
    });
  } catch (e) {
    return handleAuthError(e);
  }
}
