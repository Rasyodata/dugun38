import { prisma } from "@dugun38/db";
import { requireRole } from "@/lib/auth";
import { ok, fail, handleAuthError } from "@/lib/api";
import { CATEGORY_BY_SLUG, DISTRICT_BY_SLUG } from "@dugun38/core";
import { maskContact } from "@/lib/mask";

// Kullanıcının mesaj thread'leri (çift veya firma). Teklif başına bir thread.
export async function GET() {
  try {
    const user = await requireRole("COUPLE", "FIRM");

    let where;
    if (user.role === "COUPLE") {
      where = { coupleId: user.id };
    } else {
      const firm = await prisma.firmProfile.findUnique({ where: { userId: user.id }, select: { id: true } });
      if (!firm) return ok({ threads: [] });
      where = { firmId: firm.id };
    }

    const threads = await prisma.thread.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        firm: { select: { businessName: true, slug: true } },
        couple: { select: { name: true } },
        offer: { select: { price: true, request: { select: { categorySlug: true, districtSlug: true } }, reservation: { select: { id: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { messages: { where: { readAt: null, senderId: { not: user.id } } } } },
      },
    });

    return ok({
      threads: threads.map((t) => {
        const cat = CATEGORY_BY_SLUG[t.offer.request.categorySlug];
        const dist = DISTRICT_BY_SLUG[t.offer.request.districtSlug];
        const last = t.messages[0];
        const hasRes = Boolean(t.offer.reservation);
        return {
          id: t.id,
          otherParty: user.role === "COUPLE" ? t.firm.businessName : t.couple.name,
          firmSlug: t.firm.slug,
          context: `${cat?.name ?? ""} · ${dist?.name ?? ""}`,
          offerPrice: t.offer.price,
          hasReservation: hasRes,
          unread: t._count.messages,
          lastMessage: last ? (hasRes ? last.body : maskContact(last.body)).slice(0, 80) : null,
          lastAt: last?.createdAt ?? t.createdAt,
        };
      }),
    });
  } catch (e) {
    return handleAuthError(e);
  }
}
