import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORY_BY_SLUG, DISTRICT_BY_SLUG, formatTRY } from "@dugun38/core";
import { getFirmBySlug } from "@/lib/firms";
import { getCurrentUser } from "@/lib/auth";
import { FavoriteButton } from "@/components/FavoriteButton";
import { prisma } from "@dugun38/db";

export async function generateMetadata({ params }: PageProps<"/firma/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const firm = await getFirmBySlug(slug);
  if (!firm) return {};
  const cat = CATEGORY_BY_SLUG[firm.categorySlug];
  return {
    title: `${firm.businessName} — ${cat?.name ?? ""}`,
    description: firm.about ?? `${firm.businessName}, Kayseri. ${cat?.name}. Teklif al, yorumları gör.`,
  };
}

export default async function FirmaPage({ params }: PageProps<"/firma/[slug]">) {
  const { slug } = await params;
  const firm = await getFirmBySlug(slug);
  if (!firm || firm.user.deletedAt) notFound();

  const cat = CATEGORY_BY_SLUG[firm.categorySlug];
  const user = await getCurrentUser();

  // İletişim bilgisi yalnızca bu firmayla rezervasyonu olan çifte açılır
  let contactUnlocked = false;
  if (user?.role === "COUPLE") {
    const res = await prisma.reservation.findFirst({
      where: { coupleId: user.id, firmId: firm.id, status: { in: ["DEPOSIT_HELD", "COMPLETED"] } },
    });
    contactUnlocked = Boolean(res);
  }

  const images = firm.media.length ? firm.media : [{ id: "ph", url: `/placeholders/${firm.categorySlug}.svg`, alt: firm.businessName }];

  return (
    <div className="container-x py-8">
      <nav className="text-sm text-muted mb-3">
        <Link href="/" className="hover:text-brand-700">Anasayfa</Link> ›{" "}
        <Link href={`/kategori/${firm.categorySlug}`} className="hover:text-brand-700">Kayseri {cat?.name}</Link> ›{" "}
        <span className="text-ink">{firm.businessName}</span>
      </nav>

      {/* Galeri */}
      <div className="grid md:grid-cols-[2fr_1fr] gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[0]!.url} alt={images[0]!.alt ?? firm.businessName} className="w-full aspect-[16/10] object-cover rounded-xl" />
        <div className="hidden md:grid grid-rows-2 gap-3">
          {images.slice(1, 3).map((m) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={m.id} src={m.url} alt={m.alt ?? ""} className="w-full h-full object-cover rounded-xl" />
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8 mt-6">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-ink">{firm.businessName}</h1>
              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className="badge bg-brand-50 text-brand-700">★ {firm.ratingAvg.toFixed(1)} ({firm.ratingCount} yorum)</span>
                <span className="text-muted">{cat?.name}</span>
                {firm.verified && <span className="badge bg-green-50 text-green-700">✓ Doğrulanmış</span>}
                {firm.showcase && <span className="badge bg-gold text-white">⭐ Vitrin</span>}
              </div>
            </div>
            <FavoriteButton firmId={firm.id} canFavorite={user?.role === "COUPLE"} />
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {firm.districts.map((d) => (
              <span key={d.districtSlug} className="badge bg-white border border-line text-muted">
                📍 {DISTRICT_BY_SLUG[d.districtSlug]?.name}
              </span>
            ))}
          </div>

          {firm.about && <p className="text-muted mt-5 leading-relaxed">{firm.about}</p>}

          {/* Paketler */}
          {firm.packages.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-bold text-ink mb-3">Paketler ve fiyatlar</h2>
              <div className="space-y-3">
                {firm.packages.map((p) => (
                  <div key={p.id} className="card p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-ink">{p.name}</h3>
                      {p.description && <p className="text-sm text-muted mt-0.5">{p.description}</p>}
                    </div>
                    <span className="font-bold text-brand-700 whitespace-nowrap">{formatTRY(p.price)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Yorumlar */}
          <section className="mt-8">
            <h2 className="text-xl font-bold text-ink mb-1">Çift yorumları</h2>
            <p className="text-xs text-muted mb-3">
              Sadece Düğün38 üzerinden rezervasyon yapıp hizmet alan çiftler yorum yazabilir.
            </p>
            {firm.reviews.length === 0 ? (
              <p className="text-muted text-sm">Henüz yorum yok.</p>
            ) : (
              <div className="space-y-3">
                {firm.reviews.map((r) => (
                  <div key={r.id} className="card p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink">{r.couple.name}</span>
                      <span className="text-gold">{"★".repeat(r.rating)}<span className="text-line">{"★".repeat(5 - r.rating)}</span></span>
                    </div>
                    {r.body && <p className="text-sm text-muted mt-2">{r.body}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Yan panel — teklif / iletişim */}
        <aside className="h-fit lg:sticky lg:top-20 space-y-4">
          <div className="card p-5">
            {firm.pricePerGuest ? (
              <p className="text-2xl font-bold text-ink">{formatTRY(firm.pricePerGuest)} <span className="text-sm font-normal text-muted">/ kişi</span></p>
            ) : firm.minPrice ? (
              <p className="text-2xl font-bold text-ink">{formatTRY(firm.minPrice)}<span className="text-sm font-normal text-muted">'den başlayan</span></p>
            ) : (
              <p className="text-lg font-semibold text-ink">Fiyat için teklif alın</p>
            )}
            {firm.capacity && <p className="text-sm text-muted mt-1">Kapasite: {firm.capacity} kişiye kadar</p>}
            {firm.responseMedianMin != null && (
              <p className="text-sm text-green-700 mt-1">⚡ Ortalama ~{Math.round(firm.responseMedianMin / 60)} saatte yanıt</p>
            )}

            <Link href={`/teklif-al?category=${firm.categorySlug}&firm=${firm.slug}`} className="btn btn-primary w-full mt-4">
              Bu firmadan teklif al
            </Link>

            <div className="mt-4 pt-4 border-t border-line">
              <h3 className="text-sm font-semibold text-ink mb-1">İletişim</h3>
              {contactUnlocked && firm.publicPhone ? (
                <p className="text-sm text-ink">📞 {firm.publicPhone}</p>
              ) : (
                <p className="text-xs text-muted">
                  🔒 Telefon ve iletişim bilgileri, güvenliğiniz için rezervasyon sonrası paylaşılır.
                  Firmayla şimdi platform üzerinden mesajlaşabilirsiniz.
                </p>
              )}
            </div>
          </div>

          <div className="card p-4 bg-brand-50 border-brand-200 text-sm">
            <p className="font-semibold text-ink">🔒 Güvenli Kaparo</p>
            <p className="text-muted mt-1">
              Kaparonuz lisanslı ödeme kuruluşunda bekler, hizmeti aldıktan sonra firmaya geçer.
            </p>
            <Link href="/guvenli-kaparo" className="text-brand-700 font-medium hover:underline">Nasıl çalışır?</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
