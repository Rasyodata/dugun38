import Link from "next/link";
import { searchSchema, CATEGORY_BY_SLUG, DISTRICT_BY_SLUG } from "@dugun38/core";
import { searchFirms } from "@/lib/firms";
import { Filters } from "@/components/Filters";
import { FirmCard } from "@/components/FirmCard";

export const metadata = { title: "Arama" };

export default async function AramaPage({ searchParams }: PageProps<"/arama">) {
  const sp = await searchParams;
  const parsed = searchSchema.safeParse(sp);
  const q = parsed.success ? parsed.data : { sort: "relevance" as const, page: 1 };

  const { firms, total } = await searchFirms({
    category: q.category,
    district: q.district,
    guests: q.guests,
    priceMin: q.priceMin,
    priceMax: q.priceMax,
    sort: q.sort,
    page: q.page,
  });

  const cat = q.category ? CATEGORY_BY_SLUG[q.category] : null;
  const dist = q.district ? DISTRICT_BY_SLUG[q.district] : null;
  const title = [cat?.plural ?? "Tüm firmalar", dist ? `· ${dist.name}` : "· Kayseri"].join(" ");

  return (
    <div className="container-x py-8">
      <h1 className="text-2xl font-bold text-ink">{title}</h1>
      <p className="text-muted text-sm mt-1">{total} sonuç bulundu</p>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6 mt-6">
        <Filters />
        <div>
          {firms.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-muted">Bu kriterlere uygun firma bulunamadı.</p>
              <Link href="/teklif-al" className="btn btn-primary mt-4 inline-flex">Tek formla teklif al</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {firms.map((f) => (
                <FirmCard key={f.slug} firm={f} />
              ))}
            </div>
          )}

          <div className="card p-5 mt-6 bg-brand-50 border-brand-200 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-ink">Aradığını tam bulamadın mı?</p>
              <p className="text-sm text-muted">Tek form doldur, uygun firmalar sana teklif göndersin.</p>
            </div>
            <Link href="/teklif-al" className="btn btn-primary shrink-0">Teklif Al</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
