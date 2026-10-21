import { prisma } from "@dugun38/db";
import { requireRole } from "@/lib/auth";
import { ok, handleAuthError } from "@/lib/api";

// Admin özeti (mobil admin paneli).
export async function GET() {
  try {
    await requireRole("ADMIN");
    const [users, firms, requests, reservations, gmv, disputes] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.firmProfile.count(),
      prisma.offerRequest.count(),
      prisma.reservation.count(),
      prisma.reservation.aggregate({ where: { status: "COMPLETED" }, _sum: { totalAmount: true, commissionAmount: true } }),
      prisma.reservation.findMany({
        where: { status: "DISPUTED" },
        include: { firm: { select: { businessName: true } }, couple: { select: { name: true } } },
      }),
    ]);
    return ok({
      users, firms, requests, reservations,
      gmv: gmv._sum.totalAmount ?? 0,
      commission: gmv._sum.commissionAmount ?? 0,
      disputes: disputes.map((d) => ({
        id: d.id, firmName: d.firm.businessName, coupleName: d.couple.name,
        depositAmount: d.depositAmount, reason: d.disputeReason,
      })),
    });
  } catch (e) {
    return handleAuthError(e);
  }
}
