import Link from "next/link";
import { CATEGORY_BY_SLUG, DISTRICT_BY_SLUG, formatTRY } from "@dugun38/core";

export interface FirmCardData {
  slug: string;
  businessName: string;
  categorySlug: string;
  about: string | null;
  minPrice: number | null;
  pricePerGuest: number | null;
  capacity: number | null;
  ratingAvg: number;
  ratingCount: number;
  showcase: boolean;
  responseMedianMin: number | null;
  districts: string[];
  imageUrl: string | null;
}

export function FirmCard({ firm }: { firm: FirmCardData }) {
  const cat = CATEGORY_BY_SLUG[firm.categorySlug];
  const districtNames = firm.districts.map((d) => DISTRICT_BY_SLUG[d]?.name).filter(Boolean).slice(0, 3);

  return (
    <Link href={`/firma/${firm.slug}`} className="card overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative aspect-[4/3] bg-brand-50 flex items-center justify-center overflow-hidden">
        {firm.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={firm.imageUrl} alt={firm.businessName} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <span className="text-5xl">{cat?.icon ?? "💍"}</span>
        )}
        {firm.showcase && (
          <span className="badge absolute top-2 left-2 bg-gold text-white">⭐ Vitrin</span>
        )}
        <span className="badge absolute top-2 right-2 bg-white/90 text-ink">{cat?.name}</span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-ink leading-tight group-hover:text-brand-700">{firm.businessName}</h3>
          <span className="shrink-0 badge bg-brand-50 text-brand-700">
            ★ {firm.ratingAvg.toFixed(1)}
            <span className="text-muted font-normal">({firm.ratingCount})</span>
          </span>
        </div>
        <p className="text-xs text-muted mt-1">{districtNames.join(", ")}</p>
        {firm.about && <p className="text-sm text-muted mt-2 line-clamp-2">{firm.about}</p>}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
          <span className="text-sm font-semibold text-ink">
            {firm.pricePerGuest
              ? `${formatTRY(firm.pricePerGuest)} / kişi`
              : firm.minPrice
                ? `${formatTRY(firm.minPrice)}'den başlayan`
                : "Fiyat için teklif al"}
          </span>
          {firm.responseMedianMin != null && (
            <span className="text-xs text-green-700">⚡ ~{Math.round(firm.responseMedianMin / 60)} sa yanıt</span>
          )}
        </div>
      </div>
    </Link>
  );
}
