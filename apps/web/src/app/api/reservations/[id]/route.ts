import { prisma } from "@dugun38/db";
import { requireRole } from "@/lib/auth";
import { ok, fail, handleAuthError } from "@/lib/api";

// Tek rezervasyon detayı (mobil rezervasyon ekranı).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("COUPLE");
    const { id } = await params;
    const r = await prisma.reservation.findUnique({
      where: { id },
      include: {
        firm: { select: { businessName: true, slug: true, publicPhone: true } },
        deposit: true,
        review: { select: { id: true, rating: true } },
      },
    });
    if (!r || r.coupleId !== user.id) return fail("Rezervasyon bulunamadı", 404);

    return ok({
      id: r.id,
      firmName: r.firm.businessName,
      firmSlug: r.firm.slug,
      firmPhone: r.status === "DEPOSIT_HELD" || r.status === "COMPLETED" ? r.firm.publicPhone : null,
      totalAmount: r.totalAmount,
      depositAmount: r.depositAmount,
      commissionAmount: r.commissionAmount,
      eventDate: r.eventDate,
      status: r.status,
      disputeReason: r.disputeReason,
      deposit: r.deposit ? { status: r.deposit.status } : null,
      hasReview: Boolean(r.review),
    });
  } catch (e) {
    return handleAuthError(e);
  }
}
