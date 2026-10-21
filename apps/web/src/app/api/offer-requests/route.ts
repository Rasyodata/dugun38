import { prisma } from "@dugun38/db";
import { offerRequestSchema } from "@dugun38/core";
import { requireRole, audit } from "@/lib/auth";
import { parseBody, ok, fail, handleAuthError, clientIp } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { notifyFirmsOfRequest } from "@/lib/notify";
import { sendPush } from "@/lib/push";

// Çiftin teklif talepleri + gelen teklifler (mobil "Tekliflerim" ekranı için).
export async function GET() {
  try {
    const user = await requireRole("COUPLE");
    const requests = await prisma.offerRequest.findMany({
      where: { coupleId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        offers: {
          orderBy: { price: "asc" },
          include: {
            firm: { select: { businessName: true, slug: true, ratingAvg: true, ratingCount: true, responseMedianMin: true } },
            reservation: { select: { id: true, status: true } },
          },
        },
      },
    });
    return ok({
      requests: requests.map((r) => ({
        id: r.id,
        categorySlug: r.categorySlug,
        districtSlug: r.districtSlug,
        guests: r.guests,
        eventDate: r.eventDate,
        budget: r.budget,
        note: r.note,
        status: r.status,
        offers: r.offers.map((o) => ({
          id: o.id,
          price: o.price,
          message: o.message,
          status: o.status,
          firm: o.firm,
          reservationId: o.reservation?.id ?? null,
        })),
      })),
    });
  } catch (e) {
    return handleAuthError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireRole("COUPLE");
    const rl = rateLimit(`offer-req:${user.id}:${clientIp(req)}`, 20, 60 * 60 * 1000);
    if (!rl.ok) return fail("Çok fazla talep oluşturdunuz, lütfen biraz bekleyin.", 429);

    const { data, error } = await parseBody(req, offerRequestSchema);
    if (error) return error;

    const eventDate = new Date(data.eventDate);
    if (Number.isNaN(eventDate.getTime())) return fail("Geçersiz tarih", 422);

    const request = await prisma.offerRequest.create({
      data: {
        coupleId: user.id,
        categorySlug: data.category,
        districtSlug: data.district,
        guests: data.guests ?? null,
        eventDate,
        budget: data.budget ?? null,
        note: data.note ?? null,
        status: "OPEN",
      },
    });

    // Eşleşen firmalar: aynı kategori + bu ilçeye hizmet veren
    const matched = await prisma.firmProfile.findMany({
      where: {
        categorySlug: data.category,
        districts: { some: { districtSlug: data.district } },
        user: { deletedAt: null },
      },
      select: { id: true, userId: true, businessName: true, publicPhone: true },
    });

    if (matched.length > 0) {
      await prisma.offerRequest.update({ where: { id: request.id }, data: { status: "MATCHED" } });
      // SMS bildirimi (test modunda — konsola loglar, gerçek sağlayıcı Faz 2'de)
      await notifyFirmsOfRequest(matched, request.id);
      // Firmalara push: size uygun yeni talep
      void sendPush(matched.map((m) => m.userId), {
        title: "Yeni teklif talebi 🔔",
        body: "Size uygun yeni bir talep var. Panelden teklif verin.",
        data: { type: "request", requestId: request.id },
      });
    }

    await audit("offer_request.create", user.id, { requestId: request.id, matched: matched.length });

    return ok({ requestId: request.id, matchedCount: matched.length }, 201);
  } catch (e) {
    return handleAuthError(e);
  }
}
