import { z } from "zod";
import { prisma } from "@dugun38/db";
import { requireRole, audit } from "@/lib/auth";
import { parseBody, ok, fail, handleAuthError } from "@/lib/api";

// Admin: firma doğrulama / vitrin durumunu değiştirir.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole("ADMIN");
    const { id } = await params;
    const { data, error } = await parseBody(
      req,
      z.object({ verified: z.boolean().optional(), showcase: z.boolean().optional() }),
    );
    if (error) return error;

    const firm = await prisma.firmProfile.findUnique({ where: { id } });
    if (!firm) return fail("Firma bulunamadı", 404);

    const updated = await prisma.firmProfile.update({
      where: { id },
      data: {
        ...(data.verified !== undefined ? { verified: data.verified } : {}),
        ...(data.showcase !== undefined ? { showcase: data.showcase } : {}),
      },
    });
    if (data.verified !== undefined) await audit("admin.firm_verify", admin.id, { firmId: id, verified: data.verified });
    if (data.showcase !== undefined) await audit("admin.firm_showcase", admin.id, { firmId: id, showcase: data.showcase });

    return ok({ verified: updated.verified, showcase: updated.showcase });
  } catch (e) {
    return handleAuthError(e);
  }
}
