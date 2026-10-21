import { z } from "zod";
import { prisma } from "@dugun38/db";
import { parseBody, ok, fail, clientIp } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

const rsvpSchema = z.object({
  slug: z.string().trim().min(1),
  name: z.string().trim().min(1, "Ad zorunlu").max(80, "Ad en fazla 80 karakter"),
  attending: z.boolean(),
  guests: z.coerce.number().int().min(1).max(20).default(1),
  note: z.string().trim().max(500, "Not en fazla 500 karakter").optional(),
});

// HERKESE AÇIK — slug ile LCV (RSVP) gönder. Auth yok, rate limit var.
export async function POST(req: Request) {
  const limit = rateLimit("rsvp:" + clientIp(req), 10, 3600_000);
  if (!limit.ok) {
    return fail("Çok fazla istek. Lütfen daha sonra tekrar deneyin.", 429);
  }

  const { data, error } = await parseBody(req, rsvpSchema);
  if (error) return error;

  const site = await prisma.weddingSite.findUnique({ where: { slug: data.slug } });
  if (!site || !site.published) return fail("Davetiye bulunamadı", 404);

  await prisma.weddingRsvp.create({
    data: {
      siteId: site.id,
      name: data.name,
      attending: data.attending,
      guests: data.guests,
      note: data.note || null,
    },
  });

  return ok({ ok: true }, 201);
}
