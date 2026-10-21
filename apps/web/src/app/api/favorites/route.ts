import { z } from "zod";
import { prisma } from "@dugun38/db";
import { requireRole } from "@/lib/auth";
import { parseBody, ok, handleAuthError } from "@/lib/api";

// Çiftin favori firmaları (mobil).
export async function GET() {
  try {
    const user = await requireRole("COUPLE");
    const favs = await prisma.favorite.findMany({
      where: { coupleId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        firm: {
          include: { districts: { select: { districtSlug: true } }, media: { take: 1, orderBy: { sort: "asc" } } },
        },
      },
    });
    return ok({
      firms: favs.map((f) => ({
        slug: f.firm.slug,
        businessName: f.firm.businessName,
        categorySlug: f.firm.categorySlug,
        about: f.firm.about,
        minPrice: f.firm.minPrice,
        pricePerGuest: f.firm.pricePerGuest,
        capacity: f.firm.capacity,
        ratingAvg: f.firm.ratingAvg,
        ratingCount: f.firm.ratingCount,
        showcase: f.firm.showcase,
        responseMedianMin: f.firm.responseMedianMin,
        districts: f.firm.districts.map((d) => d.districtSlug),
        imageUrl: f.firm.media[0]?.url ?? null,
      })),
    });
  } catch (e) {
    return handleAuthError(e);
  }
}

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
