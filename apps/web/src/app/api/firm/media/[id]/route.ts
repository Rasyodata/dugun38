import { unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@dugun38/db";
import { requireRole, audit } from "@/lib/auth";
import { ok, fail, handleAuthError } from "@/lib/api";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("FIRM");
    const { id } = await params;
    const media = await prisma.media.findUnique({ where: { id }, include: { firm: { select: { userId: true } } } });
    if (!media || media.firm.userId !== user.id) return fail("Bulunamadı", 404);

    // Dosyayı sil (yalnızca kendi uploads klasörümüzdekileri)
    if (media.url.startsWith("/uploads/firms/")) {
      const file = path.join(process.cwd(), "public", media.url);
      await unlink(file).catch(() => {});
    }
    await prisma.media.delete({ where: { id } });
    await audit("firm.media_delete", user.id, { mediaId: id });
    return ok({ removed: true });
  } catch (e) {
    return handleAuthError(e);
  }
}
