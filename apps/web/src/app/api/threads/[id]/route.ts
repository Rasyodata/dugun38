import { prisma } from "@dugun38/db";
import { requireRole } from "@/lib/auth";
import { ok, fail, handleAuthError } from "@/lib/api";
import { maskContact } from "@/lib/mask";

// Thread mesajları. Üyelik kontrolü + rezervasyon öncesi iletişim maskeleme + okundu işaretleme.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("COUPLE", "FIRM");
    const { id } = await params;

    const thread = await prisma.thread.findUnique({
      where: { id },
      include: {
        firm: { select: { id: true, businessName: true, userId: true, publicPhone: true } },
        couple: { select: { id: true, name: true } },
        offer: { select: { price: true, reservation: { select: { id: true } } } },
      },
    });
    if (!thread) return fail("Konuşma bulunamadı", 404);

    const isCouple = user.role === "COUPLE" && thread.coupleId === user.id;
    const isFirm = user.role === "FIRM" && thread.firm.userId === user.id;
    if (!isCouple && !isFirm) return fail("Bu konuşmaya erişiminiz yok", 403);

    const canRevealContact = Boolean(thread.offer.reservation);

    const messages = await prisma.message.findMany({
      where: { threadId: id },
      orderBy: { createdAt: "asc" },
    });

    // Karşı taraftan gelen okunmamışları okundu yap
    await prisma.message.updateMany({
      where: { threadId: id, senderId: { not: user.id }, readAt: null },
      data: { readAt: new Date() },
    });

    return ok({
      id: thread.id,
      otherParty: isCouple ? thread.firm.businessName : thread.couple.name,
      offerPrice: thread.offer.price,
      canRevealContact,
      firmPhone: canRevealContact ? thread.firm.publicPhone : null,
      messages: messages.map((m) => ({
        id: m.id,
        mine: m.senderId === user.id,
        body: canRevealContact ? m.body : maskContact(m.body),
        createdAt: m.createdAt,
      })),
    });
  } catch (e) {
    return handleAuthError(e);
  }
}
