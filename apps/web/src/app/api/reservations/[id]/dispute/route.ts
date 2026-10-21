import { z } from "zod";
import { prisma } from "@dugun38/db";
import { requireRole, audit } from "@/lib/auth";
import { parseBody, ok, fail, handleAuthError } from "@/lib/api";

// Çift itiraz açar → DISPUTED. Admin karar verene kadar kaparo tutulmaya devam eder.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("COUPLE");
    const { id } = await params;
    const { data, error } = await parseBody(req, z.object({ reason: z.string().min(5).max(1000) }));
    if (error) return error;

    const r = await prisma.reservation.findUnique({ where: { id } });
    if (!r) return fail("Rezervasyon bulunamadı", 404);
    if (r.coupleId !== user.id) return fail("Yetkiniz yok", 403);
    if (r.status !== "DEPOSIT_HELD") return fail("İtiraz yalnızca kaparo bekletilirken açılabilir", 409);

    await prisma.reservation.update({ where: { id: r.id }, data: { status: "DISPUTED", disputeReason: data.reason } });
    await audit("reservation.disputed", user.id, { reservationId: r.id });
    return ok({ status: "DISPUTED" });
  } catch (e) {
    return handleAuthError(e);
  }
}
