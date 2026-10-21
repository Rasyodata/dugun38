import { prisma } from "@dugun38/db";
import { calcDeposit, calcCommission } from "@dugun38/core";
import { requireRole, audit } from "@/lib/auth";
import { ok, fail, handleAuthError } from "@/lib/api";
import { sendPush } from "@/lib/push";

// Çift bir teklifi kabul eder → rezervasyon (kaparo bekleniyor) oluşur.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("COUPLE");
    const { id } = await params;

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { request: true, reservation: true, firm: { select: { userId: true } } },
    });
    if (!offer) return fail("Teklif bulunamadı", 404);
    if (offer.request.coupleId !== user.id) return fail("Bu teklif size ait değil", 403);
    if (offer.reservation) return fail("Bu teklif için zaten rezervasyon var", 409);

    const total = offer.price;
    const reservation = await prisma.$transaction(async (tx) => {
      const r = await tx.reservation.create({
        data: {
          offerId: offer.id,
          coupleId: user.id,
          firmId: offer.firmId,
          totalAmount: total,
          depositAmount: calcDeposit(total),
          commissionAmount: calcCommission(total),
          eventDate: offer.request.eventDate,
          status: "PENDING_DEPOSIT",
        },
      });
      await tx.offer.update({ where: { id: offer.id }, data: { status: "ACCEPTED" } });
      // Diğer teklifleri reddet, talebi kapat
      await tx.offer.updateMany({
        where: { requestId: offer.requestId, id: { not: offer.id }, status: { in: ["SENT", "VIEWED"] } },
        data: { status: "DECLINED" },
      });
      await tx.offerRequest.update({ where: { id: offer.requestId }, data: { status: "CLOSED" } });
      return r;
    });

    await audit("offer.accept", user.id, { offerId: offer.id, reservationId: reservation.id });

    // Firmaya push: teklifiniz kabul edildi
    void sendPush([offer.firm.userId], {
      title: "Teklifiniz kabul edildi 🎉",
      body: "Bir çift teklifinizi kabul etti. Rezervasyon oluşturuldu.",
      data: { type: "reservation", reservationId: reservation.id },
    });

    return ok({ reservationId: reservation.id, depositAmount: reservation.depositAmount }, 201);
  } catch (e) {
    return handleAuthError(e);
  }
}
