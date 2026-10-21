import { prisma } from "@dugun38/db";
import { messageSchema } from "@dugun38/core";
import { requireRole, audit } from "@/lib/auth";
import { parseBody, ok, fail, handleAuthError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const user = await requireRole("COUPLE", "FIRM");
    const rl = rateLimit(`msg:${user.id}`, 60, 60 * 1000);
    if (!rl.ok) return fail("Çok hızlı mesaj gönderiyorsunuz, biraz yavaşlayın.", 429);

    const { data, error } = await parseBody(req, messageSchema);
    if (error) return error;

    const thread = await prisma.thread.findUnique({
      where: { id: data.threadId },
      include: { firm: { select: { userId: true } } },
    });
    if (!thread) return fail("Konuşma bulunamadı", 404);

    const isCouple = user.role === "COUPLE" && thread.coupleId === user.id;
    const isFirm = user.role === "FIRM" && thread.firm.userId === user.id;
    if (!isCouple && !isFirm) return fail("Bu konuşmaya mesaj gönderemezsiniz", 403);

    const msg = await prisma.message.create({
      data: { threadId: data.threadId, senderId: user.id, body: data.body },
    });
    await audit("message.send", user.id, { threadId: data.threadId });

    return ok({ id: msg.id, createdAt: msg.createdAt }, 201);
  } catch (e) {
    return handleAuthError(e);
  }
}
