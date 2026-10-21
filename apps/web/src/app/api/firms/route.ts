import { searchSchema } from "@dugun38/core";
import { searchFirms } from "@/lib/firms";
import { ok, fail } from "@/lib/api";

// JSON firma arama API'si — web ve mobil uygulama ortak kullanır.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const parsed = searchSchema.safeParse(params);
  if (!parsed.success) return fail("Geçersiz arama parametreleri", 422);

  const { firms, total } = await searchFirms({
    category: parsed.data.category,
    district: parsed.data.district,
    guests: parsed.data.guests,
    priceMin: parsed.data.priceMin,
    priceMax: parsed.data.priceMax,
    sort: parsed.data.sort,
    page: parsed.data.page,
  });

  return ok({ firms, total, page: parsed.data.page });
}
