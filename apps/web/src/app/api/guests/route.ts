import { z } from "zod";
import { prisma } from "@dugun38/db";
import { requireRole } from "@/lib/auth";
import { parseBody, ok, handleAuthError } from "@/lib/api";

// Çiftin davetli listesi + LCV istatistikleri (davetli yönetimi).
export async function GET() {
  try {
    const user = await requireRole("COUPLE");
    const guests = await prisma.guest.findMany({
      where: { coupleId: user.id },
      orderBy: { name: "asc" },
    });

    const stats = guests.reduce(
      (acc, g) => {
        acc.total += 1;
        if (g.rsvp === "YES") acc.attending += g.seats;
        else if (g.rsvp === "NO") acc.declined += 1;
        else if (g.rsvp === "PENDING") acc.pending += 1;
        return acc;
      },
      { total: 0, attending: 0, pending: 0, declined: 0 },
    );

    return ok({ guests, stats });
  } catch (e) {
    return handleAuthError(e);
  }
}

const createSchema = z.object({
  name: z.string().trim().min(1, "Ad zorunlu").max(80, "Ad en fazla 80 karakter"),
  phone: z.string().trim().optional(),
  side: z.enum(["gelin", "damat"]).optional(),
  seats: z.coerce.number().int().min(1).max(20).default(1),
});

// Yeni davetli ekle.
export async function POST(req: Request) {
  try {
    const user = await requireRole("COUPLE");
    const { data, error } = await parseBody(req, createSchema);
    if (error) return error;

    const guest = await prisma.guest.create({
      data: {
        coupleId: user.id,
        name: data.name,
        phone: data.phone || null,
        side: data.side ?? null,
        seats: data.seats,
      },
    });
    return ok(guest, 201);
  } catch (e) {
    return handleAuthError(e);
  }
}
