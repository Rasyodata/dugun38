import { z } from "zod";
import { prisma } from "@dugun38/db";
import { requireRole, audit } from "@/lib/auth";
import { parseBody, ok, fail, handleAuthError } from "@/lib/api";

// Admin itirazı karara bağlar: kaparo firmaya aktarılır (release) ya da çifte iade (refund).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole("ADMIN");
    const { id } = await params;
    const { data, error } = await parseBody(req, z.object({ decision: z.enum(["release", "refund"]) }));
    if (error) return error;

    const r = await prisma.reservation.findUnique({ where: { id }, include: { deposit: true } });
    if (!r) return fail("Rezervasyon bulunamadı", 404);
    if (r.status !== "DISPUTED") return fail("Bu rezervasyon itirazlı değil", 409);

    await prisma.$transaction(async (tx) => {
      if (data.decision === "release") {
        if (r.deposit) await tx.deposit.update({ where: { id: r.deposit.id }, data: { status: "RELEASED", releasedAt: new Date() } });
        await tx.reservation.update({ where: { id: r.id }, data: { status: "COMPLETED", completedAt: new Date() } });
      } else {
        if (r.deposit) await tx.deposit.update({ where: { id: r.deposit.id }, data: { status: "REFUNDED", releasedAt: new Date() } });
        await tx.reservation.update({ where: { id: r.id }, data: { status: "REFUNDED" } });
      }
    });

    await audit("admin.dispute_resolved", admin.id, { reservationId: r.id, decision: data.decision });
    return ok({ ok: true });
  } catch (e) {
    return handleAuthError(e);
  }
}
