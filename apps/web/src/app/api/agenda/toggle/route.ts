import { z } from "zod";
import { prisma } from "@dugun38/db";
import { requireRole } from "@/lib/auth";
import { parseBody, ok, fail, handleAuthError } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const user = await requireRole("COUPLE");
    const { data, error } = await parseBody(req, z.object({ id: z.string().min(1), done: z.boolean() }));
    if (error) return error;
    const item = await prisma.agendaItem.findUnique({ where: { id: data.id } });
    if (!item || item.coupleId !== user.id) return fail("Bulunamadı", 404);
    await prisma.agendaItem.update({ where: { id: data.id }, data: { done: data.done } });
    return ok({ ok: true });
  } catch (e) {
    return handleAuthError(e);
  }
}
