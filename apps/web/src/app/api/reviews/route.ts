import { z } from "zod";
import { prisma } from "@dugun38/db";
import { requireRole, audit } from "@/lib/auth";
import { parseBody, ok, fail, handleAuthError } from "@/lib/api";

const schema = z.object({
  reservationId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().max(2000).optional(),
});

// Yorum yalnızca tamamlanmış (kaparosu firmaya geçmiş) rezervasyondan yazılabilir.
export async function POST(req: Request) {
  try {
    const user = await requireRole("COUPLE");
    const { data, error } = await parseBody(req, schema);
    if (error) return error;

    const r = await prisma.reservation.findUnique({ where: { id: data.reservationId }, include: { review: true } });
    if (!r) return fail("Rezervasyon bulunamadı", 404);
    if (r.coupleId !== user.id) return fail("Yetkiniz yok", 403);
    if (r.status !== "COMPLETED") return fail("Yorum yalnızca tamamlanmış rezervasyondan yazılabilir", 403);
    if (r.review) return fail("Bu rezervasyon için zaten yorum yaptınız", 409);

    await prisma.$transaction(async (tx) => {
      await tx.review.create({
        data: { reservationId: r.id, firmId: r.firmId, coupleId: user.id, rating: data.rating, body: data.body ?? null },
      });
      // Firma puan ortalamasını güncelle
      const agg = await tx.review.aggregate({ where: { firmId: r.firmId }, _avg: { rating: true }, _count: true });
      await tx.firmProfile.update({
        where: { id: r.firmId },
        data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count },
      });
    });

    await audit("review.create", user.id, { reservationId: r.id });
    return ok({ ok: true }, 201);
  } catch (e) {
    return handleAuthError(e);
  }
}
