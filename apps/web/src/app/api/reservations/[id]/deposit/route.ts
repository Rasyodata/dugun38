import { prisma } from "@dugun38/db";
import { requireRole, audit } from "@/lib/auth";
import { ok, fail, handleAuthError } from "@/lib/api";

// Güvenli Kaparo — TEST MODU. Gerçek iyzico Pazaryeri entegrasyonu Faz 2'de.
// Para lisanslı ödeme kuruluşunda "HELD" olarak tutulur (simülasyon).
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("COUPLE");
    const { id } = await params;
    const r = await prisma.reservation.findUnique({ where: { id }, include: { deposit: true } });
    if (!r) return fail("Rezervasyon bulunamadı", 404);
    if (r.coupleId !== user.id) return fail("Yetkiniz yok", 403);
    if (r.status !== "PENDING_DEPOSIT") return fail("Bu rezervasyon için kaparo zaten işlendi", 409);

    await prisma.$transaction(async (tx) => {
      await tx.deposit.create({
        data: {
          reservationId: r.id,
          amount: r.depositAmount,
          status: "HELD",
          provider: "iyzico",
          providerRef: `TEST-${id.slice(-8)}`,
        },
      });
      await tx.reservation.update({ where: { id: r.id }, data: { status: "DEPOSIT_HELD" } });
    });

    await audit("reservation.deposit_held", user.id, { reservationId: r.id, amount: r.depositAmount });
    return ok({ status: "DEPOSIT_HELD" });
  } catch (e) {
    return handleAuthError(e);
  }
}
