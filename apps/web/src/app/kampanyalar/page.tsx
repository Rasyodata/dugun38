import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@dugun38/db";
import { CATEGORY_BY_SLUG, DISTRICT_BY_SLUG } from "@dugun38/core";

export const metadata: Metadata = {
  title: "Kampanyalar & Fırsatlar",
  description:
    "Kayseri'deki düğün salonları, kır düğünü mekanları ve düğün firmalarının güncel kampanya ve indirim fırsatları. Hafta içi düğün, erken rezervasyon ve hediyeli paketler Düğün38'de.",
  alternates: { canonical: "/kampanyalar" },
};

async function getCampaigns() {
  try {
    return await prisma.campaign.findMany({
      where: { active: true, firm: { user: { deletedAt: null } } },
      orderBy: { createdAt: "desc" },
      include: {
        firm: {
          select: {
            slug: true,
            businessName: true,
            categorySlug: true,
            media: { orderBy: { sort: "asc" }, take: 1, select: { url: true } },
          },
        },
      },
    });
  } catch {
    return [];
  }
}

function formatDate(d: Date | null) {
  if (!d) return null;
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long" }).format(d);
}

export default async function KampanyalarPage() {
  const campaigns = await getCampaigns();

  return (
    <div className="container-x py-10">
      <nav className="text-sm text-muted mb-3">
        <Link href="/" className="hover:text-brand-700">Anasayfa</Link> › <span className="text-ink">Kampanyalar</span>
      </nav>

      <div className="max-w-3xl">
        <span className="badge bg-gold/15 text-gold mb-4">🎁 Fırsatlar</span>
        <h1 className="text-3xl font-bold text-ink">Kampanyalar &amp; Fırsatlar</h1>
        <p className="text-muted leading-relaxed mt-2">
          Kayseri&apos;deki mekan ve firmaların güncel kampanyaları. Hafta içi düğün indirimleri,
          erken rezervasyon fırsatları ve hediyeli paketleri kaçırmayın — fırsatı inceleyip tek
          formla teklif alın.
        </p>
      </div>

      {campaigns.length === 0 ? (
        <div className="card p-10 text-center mt-8">
          <p className="text-muted">Şu an aktif kampanya bulunmuyor. Yakında yeni fırsatlar eklenecek.</p>
          <Link href="/mekanlar" className="btn btn-primary mt-4 inline-flex">Mekanları keşfet</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {campaigns.map((c) => {
            const cat = CATEGORY_BY_SLUG[c.firm.categorySlug];
            const district = c.districtSlug ? DISTRICT_BY_SLUG[c.districtSlug]?.name : null;
            const until = formatDate(c.validUntil);
            const img = c.firm.media[0]?.url ?? null;
            return (
              <Link
                key={c.id}
                href={`/firma/${c.firm.slug}`}
                className="card overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="relative aspect-[16/9] bg-brand-50 overflow-hidden">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={c.firm.businessName} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-5xl">{cat?.icon ?? "🎁"}</span>
                  )}
                  <span className="badge absolute top-2 left-2 bg-gold text-white font-semibold">{c.dealLabel}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <span>{cat?.icon} {cat?.name}</span>
                    {district && <span>· {district}</span>}
                  </div>
                  <h3 className="font-semibold text-ink mt-1 group-hover:text-brand-700">{c.title}</h3>
                  <p className="text-xs text-muted mt-0.5">{c.firm.businessName}</p>
                  <p className="text-sm text-muted mt-2 line-clamp-2">{c.description}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
                    <span className="text-sm font-semibold text-brand-700">Fırsatı İncele →</span>
                    {until && <span className="text-xs text-muted">{until}&apos;e kadar</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
