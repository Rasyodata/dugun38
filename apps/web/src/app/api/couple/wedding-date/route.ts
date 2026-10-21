import { z } from "zod";
import { prisma } from "@dugun38/db";
import { requireRole } from "@/lib/auth";
import { parseBody, ok, handleAuthError } from "@/lib/api";

const schema = z.object({
  date: z.string().optional(), // ISO yyyy-mm-dd ("" → temizle)
  partnerName: z.string().max(80).optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireRole("COUPLE");
    const { data, error } = await parseBody(req, schema);
    if (error) return error;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        weddingDate: data.date ? new Date(data.date) : null,
        ...(data.partnerName !== undefined ? { partnerName: data.partnerName || null } : {}),
      },
    });
    return ok({ ok: true });
  } catch (e) {
    return handleAuthError(e);
  }
}
