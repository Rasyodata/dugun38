import { prisma } from "@dugun38/db";
import { CATEGORY_BY_SLUG, DISTRICT_BY_SLUG, formatTRY } from "@dugun38/core";

// Giriş ekranının solunda görünen CANLI panel — gerçek platform verilerinden beslenir.
async function getStats() {
  try {
    const [
      firmCount,
      campaignCount,
      reservationCount,
      offerCount,
      reviewCount,
      ratingAgg,
      gmvAgg,
      districtGroups,
      recent,
    ] = await Promise.all([
      prisma.firmProfile.count({ where: { user: { deletedAt: null } } }),
      prisma.campaign.count({ where: { active: true } }),
      prisma.reservation.count(),
      prisma.offer.count(),
      prisma.review.count(),
      prisma.firmProfile.aggregate({ _avg: { ratingAvg: true }, where: { user: { deletedAt: null }, ratingCount: { gt: 0 } } }),
      prisma.reservation.aggregate({ _sum: { totalAmount: true } }),
      prisma.firmDistrict.groupBy({ by: ["districtSlug"], where: { firm: { user: { deletedAt: null } } } }),
      prisma.firmProfile.findMany({
        where: { user: { deletedAt: null } },
        orderBy: [{ showcase: "desc" }, { createdAt: "desc" }],
        take: 4,
        select: {
          slug: true,
          businessName: true,
          categorySlug: true,
          ratingAvg: true,
          ratingCount: true,
          districts: { select: { districtSlug: true }, take: 1 },
          media: { orderBy: { sort: "asc" }, take: 1, select: { url: true } },
        },
      }),
    ]);
    return {
      firmCount,
      campaignCount,
      reservationCount,
      offerCount,
      reviewCount,
      avgRating: ratingAgg._avg.ratingAvg ?? 0,
      gmv: gmvAgg._sum.totalAmount ?? 0,
      districtCount: districtGroups.length,
      recent,
    };
  } catch {
    return null;
  }
}

export async function LoginLiveDashboard() {
  const s = await getStats();

  return (
    <aside className="relative overflow-hidden text-white bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 p-8 lg:p-12 flex flex-col justify-between order-2 lg:order-1 min-h-[420px]">
      {/* dekoratif ışıltı */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-20 w-72 h-72 rounded-full bg-gold/20 blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
          </span>
          <span className="tracking-wide uppercase text-white/80">Canlı Panel</span>
        </div>
        <h2 className="font-display text-3xl lg:text-4xl mt-5 leading-tight">
          Kayseri&apos;nin düğün<br />pazarı anlık burada
        </h2>
        <p className="text-white/70 text-sm mt-3 max-w-sm">
          Giriş yapmadan platformun nabzını gör: kayıtlı mekanlar, aktif fırsatlar ve
          Güvenli Kaparo ile güvence altına alınan işlemler.
        </p>
      </div>

      {s ? (
        <>
          <div className="relative grid grid-cols-2 gap-3 mt-8">
            <Stat label="Kayıtlı firma" value={s.firmCount} suffix="" />
            <Stat label="Hizmet verilen ilçe" value={s.districtCount} suffix="/16" />
            <Stat label="Aktif kampanya" value={s.campaignCount} />
            <Stat label="Ortalama puan" value={s.avgRating.toFixed(1)} prefix="★ " />
            <Stat label="Alınan teklif" value={s.offerCount} />
            <Stat label="Güvenli Kaparo hacmi" value={formatTRY(s.gmv)} small />
          </div>

          <div className="relative mt-8">
            <div className="text-xs uppercase tracking-wide text-white/60 mb-3">Öne çıkan mekanlar</div>
            <ul className="space-y-2.5">
              {s.recent.map((f) => {
                const cat = CATEGORY_BY_SLUG[f.categorySlug];
                const district = f.districts[0] ? DISTRICT_BY_SLUG[f.districts[0].districtSlug]?.name : null;
                const img = f.media[0]?.url ?? null;
                return (
                  <li key={f.slug} className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm p-2 pr-3">
                    <span className="h-10 w-10 shrink-0 rounded-lg bg-white/15 overflow-hidden flex items-center justify-center">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={f.businessName} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-lg">{cat?.icon ?? "💍"}</span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium truncate">{f.businessName}</span>
                      <span className="block text-xs text-white/60 truncate">
                        {cat?.name}{district ? ` · ${district}` : ""}
                      </span>
                    </span>
                    {f.ratingCount > 0 && (
                      <span className="text-xs font-semibold text-gold shrink-0">★ {f.ratingAvg.toFixed(1)}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      ) : (
        <div className="relative mt-8 text-white/60 text-sm">Panel verileri birazdan yüklenecek…</div>
      )}
    </aside>
  );
}

function Stat({
  label,
  value,
  prefix = "",
  suffix = "",
  small = false,
}: {
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3">
      <div className={`font-display font-semibold ${small ? "text-lg" : "text-2xl"}`}>
        {prefix}
        {value}
        {suffix && <span className="text-sm font-normal text-white/70">{suffix}</span>}
      </div>
      <div className="text-[11px] text-white/60 mt-0.5 leading-tight">{label}</div>
    </div>
  );
}
