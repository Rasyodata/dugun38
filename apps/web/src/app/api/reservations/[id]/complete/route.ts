import { prisma } from "@dugun38/db";
import { requireRole, audit } from "@/lib/auth";
import { ok, fail, handleAuthError } from "@/lib/api";

// Çift hizmeti aldığını onaylar → kaparo firmaya serbest bırakılır, rezervasyon tamamlanır.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("COUPLE");
    const { id } = await params;
    const r = await prisma.reservation.findUnique({ where: { id }, include: { deposit: true } });
    if (!r) return fail("Rezervasyon bulunamadı", 404);
    if (r.coupleId !== user.id) return fail("Yetkiniz yok", 403);
    if (r.status !== "DEPOSIT_HELD") return fail("Bu işlem için uygun durumda değil", 409);

    await prisma.$transaction(async (tx) => {
      if (r.deposit) {
        await tx.deposit.update({ where: { id: r.deposit.id }, data: { status: "RELEASED", releasedAt: new Date() } });
      }
      await tx.reservation.update({ where: { id: r.id }, data: { status: "COMPLETED", completedAt: new Date() } });
    });

    await audit("reservation.completed", user.id, { reservationId: r.id });
    return ok({ status: "COMPLETED" });
  } catch (e) {
    return handleAuthError(e);
  }
}
