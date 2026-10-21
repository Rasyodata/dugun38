import { z } from "zod";
import { prisma } from "@dugun38/db";
import { requireRole } from "@/lib/auth";
import { parseBody, ok, handleAuthError } from "@/lib/api";

// Türkçe karakterleri sadeleştirerek URL-dostu slug üret.
function slugify(input: string): string {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
  };
  return input
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

// Verilen taban slug'dan (mevcut kayıt hariç) benzersiz slug üret.
async function uniqueSlug(base: string, selfId: string | null): Promise<string> {
  const root = base || "dugun";
  let candidate = root;
  let i = 1;
  // Çakışma varsa -2, -3 ... ekle.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.weddingSite.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === selfId) return candidate;
    i += 1;
    candidate = `${root}-${i}`;
  }
}

// Çiftin düğün web sitesini döndür (yoksa null). RSVP sayısını da ekle.
export async function GET() {
  try {
    const user = await requireRole("COUPLE");
    const site = await prisma.weddingSite.findUnique({
      where: { coupleId: user.id },
      include: { _count: { select: { rsvps: true } } },
    });
    if (!site) return ok({ site: null });
    const { _count, ...rest } = site;
    return ok({ site: { ...rest, rsvpCount: _count.rsvps } });
  } catch (e) {
    return handleAuthError(e);
  }
}

const saveSchema = z.object({
  brideName: z.string().trim().max(80).optional(),
  groomName: z.string().trim().max(80).optional(),
  eventDate: z.string().trim().optional(),
  venueText: z.string().trim().max(300).optional(),
  story: z.string().trim().max(2000, "Hikaye en fazla 2000 karakter").optional(),
  published: z.boolean().optional(),
});

// Çiftin düğün sitesini kaydet/güncelle (upsert — coupleId @unique).
export async function POST(req: Request) {
  try {
    const user = await requireRole("COUPLE");
    const { data, error } = await parseBody(req, saveSchema);
    if (error) return error;

    const existing = await prisma.weddingSite.findUnique({ where: { coupleId: user.id } });

    const brideName = data.brideName || null;
    const groomName = data.groomName || null;
    const eventDate = data.eventDate ? new Date(data.eventDate) : null;
    const venueText = data.venueText || null;
    const story = data.story || null;

    // Slug: mevcut varsa koru, yoksa isimlerden üret.
    let slug = existing?.slug;
    if (!slug) {
      const base = slugify([brideName, groomName].filter(Boolean).join("-"));
      slug = await uniqueSlug(base, existing?.id ?? null);
    }

    const site = await prisma.weddingSite.upsert({
      where: { coupleId: user.id },
      create: {
        coupleId: user.id,
        slug,
        brideName,
        groomName,
        eventDate: eventDate && !Number.isNaN(eventDate.getTime()) ? eventDate : null,
        venueText,
        story,
        published: data.published ?? false,
      },
      update: {
        brideName,
        groomName,
        eventDate: eventDate && !Number.isNaN(eventDate.getTime()) ? eventDate : null,
        venueText,
        story,
        ...(data.published !== undefined ? { published: data.published } : {}),
      },
    });

    return ok({ slug: site.slug });
  } catch (e) {
    return handleAuthError(e);
  }
}
