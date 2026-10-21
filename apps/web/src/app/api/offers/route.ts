import { prisma } from "@dugun38/db";
import { offerSchema } from "@dugun38/core";
import { requireRole, audit } from "@/lib/auth";
import { parseBody, ok, fail, handleAuthError } from "@/lib/api";

// Firma, bir teklif talebine teklif verir.
export async function POST(req: Request) {
  try {
    const user = await requireRole("FIRM");
    const { data, error } = await parseBody(req, offerSchema);
    if (error) return error;

    const firm = await prisma.firmProfile.findUnique({ where: { userId: user.id } });
    if (!firm) return fail("Önce firma profilinizi oluşturun", 400);

    const request = await prisma.offerRequest.findUnique({ where: { id: data.requestId } });
    if (!request) return fail("Talep bulunamadı", 404);
    if (request.status === "CLOSED") return fail("Bu talep kapandı", 409);

    // Firma kategori + bölge uyumu
    const serves = await prisma.firmDistrict.findUnique({
      where: { firmId_districtSlug: { firmId: firm.id, districtSlug: request.districtSlug } },
    });
    if (firm.categorySlug !== request.categorySlug || !serves) {
      return fail("Bu talep firmanızın kategori/bölgesine uygun değil", 403);
    }

    // Tek teklif kuralı (upsert)
    const offer = await prisma.offer.upsert({
      where: { requestId_firmId: { requestId: data.requestId, firmId: firm.id } },
      update: { price: data.price, message: data.message ?? null, status: "SENT" },
      create: {
        requestId: data.requestId,
        firmId: firm.id,
        price: data.price,
        message: data.message ?? null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
      },
    });

    // Teklif başına mesajlaşma thread'i (yoksa oluştur)
    await prisma.thread.upsert({
      where: { offerId: offer.id },
      update: {},
      create: { offerId: offer.id, coupleId: request.coupleId, firmId: firm.id },
    });

    await audit("offer.create", user.id, { offerId: offer.id, requestId: data.requestId });
    return ok({ offerId: offer.id }, 201);
  } catch (e) {
    return handleAuthError(e);
  }
}
