import { z } from "zod";
import { prisma } from "@dugun38/db";
import { requireRole } from "@/lib/auth";
import { parseBody, ok, handleAuthError } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const user = await requireRole("COUPLE");
    const { data, error } = await parseBody(req, z.object({ firmId: z.string().min(1) }));
    if (error) return error;

    const existing = await prisma.favorite.findUnique({
      where: { coupleId_firmId: { coupleId: user.id, firmId: data.firmId } },
    });
    if (existing) {
      await prisma.favorite.delete({ where: { coupleId_firmId: { coupleId: user.id, firmId: data.firmId } } });
      return ok({ favorited: false });
    }
    await prisma.favorite.create({ data: { coupleId: user.id, firmId: data.firmId } });
    return ok({ favorited: true });
  } catch (e) {
    return handleAuthError(e);
  }
}
