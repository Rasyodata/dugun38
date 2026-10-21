import { z } from "zod";
import { prisma } from "@dugun38/db";
import { requireRole } from "@/lib/auth";
import { parseBody, ok, fail, handleAuthError } from "@/lib/api";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  phone: z.string().trim().optional(),
  side: z.enum(["gelin", "damat"]).optional(),
  rsvp: z.enum(["PENDING", "YES", "NO", "MAYBE"]).optional(),
  seats: z.coerce.number().int().min(1).max(20).optional(),
});

// Davetliyi düzenle / LCV durumunu güncelle.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("COUPLE");
    const { id } = await params;
    const { data, error } = await parseBody(req, patchSchema);
    if (error) return error;

    const existing = await prisma.guest.findUnique({ where: { id } });
    if (!existing || existing.coupleId !== user.id) return fail("Bulunamadı", 404);

    const guest = await prisma.guest.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.phone !== undefined ? { phone: data.phone || null } : {}),
        ...(data.side !== undefined ? { side: data.side } : {}),
        ...(data.rsvp !== undefined ? { rsvp: data.rsvp } : {}),
        ...(data.seats !== undefined ? { seats: data.seats } : {}),
      },
    });
    return ok(guest);
  } catch (e) {
    return handleAuthError(e);
  }
}

// Davetliyi sil.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("COUPLE");
    const { id } = await params;

    const existing = await prisma.guest.findUnique({ where: { id } });
    if (!existing || existing.coupleId !== user.id) return fail("Bulunamadı", 404);

    await prisma.guest.delete({ where: { id } });
    return ok({ removed: true });
  } catch (e) {
    return handleAuthError(e);
  }
}
