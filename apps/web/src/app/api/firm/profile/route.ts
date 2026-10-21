import { prisma } from "@dugun38/db";
import { firmProfileSchema } from "@dugun38/core";
import { requireRole, audit } from "@/lib/auth";
import { parseBody, ok, handleAuthError } from "@/lib/api";

function slugify(s: string): string {
  const map: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i" };
  return s.replace(/[çğıöşüİ]/g, (c) => map[c] ?? c).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function POST(req: Request) {
  try {
    const user = await requireRole("FIRM");
    const { data, error } = await parseBody(req, firmProfileSchema);
    if (error) return error;

    const existing = await prisma.firmProfile.findUnique({ where: { userId: user.id } });

    let slug = existing?.slug;
    if (!slug) {
      const base = slugify(data.businessName) || "firma";
      slug = base;
      let n = 1;
      while (await prisma.firmProfile.findUnique({ where: { slug } })) slug = `${base}-${++n}`;
    }

    const payload = {
      businessName: data.businessName,
      categorySlug: data.categorySlug,
      about: data.about ?? null,
      minPrice: data.minPrice ?? null,
      maxPrice: data.maxPrice ?? null,
      capacity: data.capacity ?? null,
      pricePerGuest: data.pricePerGuest ?? null,
      publicPhone: data.phone ?? null,
      address: data.address ?? null,
    };

    const firm = await prisma.firmProfile.upsert({
      where: { userId: user.id },
      update: payload,
      create: { userId: user.id, slug: slug!, ...payload },
    });

    // Hizmet bölgelerini yeniden yaz
    await prisma.firmDistrict.deleteMany({ where: { firmId: firm.id } });
    await prisma.firmDistrict.createMany({
      data: data.districts.map((d) => ({ firmId: firm.id, districtSlug: d })),
    });

    await audit("firm.profile_save", user.id, { firmId: firm.id });
    return ok({ slug: firm.slug }, existing ? 200 : 201);
  } catch (e) {
    return handleAuthError(e);
  }
}
