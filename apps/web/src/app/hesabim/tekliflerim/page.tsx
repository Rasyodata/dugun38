import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@dugun38/db";
import { CATEGORY_BY_SLUG, DISTRICT_BY_SLUG, formatTRY } from "@dugun38/core";
import { getCurrentUser } from "@/lib/auth";
import { AcceptOfferButton } from "@/components/AcceptOfferButton";

export const metadata = { title: "Tekliflerim" };

export default async function TekliflerimPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  if (user.role !== "COUPLE") redirect("/");

  const requests = await prisma.offerRequest.findMany({
    where: { coupleId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      offers: {
        orderBy: { price: "asc" },
        include: { firm: { select: { businessName: true, slug: true, ratingAvg: true, ratingCount: true, responseMedianMin: true } }, reservation: true },
      },
    },
  });

  return (
    <div className="container-x py-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-ink">Tekliflerim</h1>
      <p className="text-muted text-sm mt-1">Taleplerinize gelen teklifleri yan yana karşılaştırın.</p>

      {requests.length === 0 ? (
        <div className="card p-10 text-center mt-6">
          <p className="text-muted">Henüz teklif talebiniz yok.</p>
          <Link href="/teklif-al" className="btn btn-primary mt-4 inline-flex">Tek formla teklif al</Link>
        </div>
      ) : (
        <div className="space-y-6 mt-6">
          {requests.map((r) => {
            const cat = CATEGORY_BY_SLUG[r.categorySlug];
            const dist = DISTRICT_BY_SLUG[r.districtSlug];
            const accepted = r.offers.find((o) => o.reservation);
            return (
              <div key={r.id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-ink">{cat?.icon} {cat?.name} · {dist?.name}</h2>
                    <p className="text-xs text-muted mt-0.5">
                      {r.guests ? `${r.guests} kişi · ` : ""}
                      {new Date(r.eventDate).toLocaleDateString("tr-TR")}
                      {r.budget ? ` · Bütçe ${formatTRY(r.budget)}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                {r.note && <p className="text-sm text-muted mt-2 bg-cream rounded p-2">“{r.note}”</p>}

                {r.offers.length === 0 ? (
                  <p className="text-sm text-muted mt-4">Henüz teklif gelmedi. Firmalara bildirildi, bekleyin.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                    {r.offers.map((o) => (
                      <div key={o.id} className={`card p-4 ${o.reservation ? "border-green-400 bg-green-50" : ""}`}>
                        <div className="flex items-center justify-between">
                          <Link href={`/firma/${o.firm.slug}`} className="font-semibold text-ink hover:text-brand-700 text-sm">
                            {o.firm.businessName}
                          </Link>
                          <span className="badge bg-brand-50 text-brand-700 text-xs">★ {o.firm.ratingAvg.toFixed(1)}</span>
                        </div>
                        <p className="text-2xl font-bold text-ink mt-2">{formatTRY(o.price)}</p>
                        {o.message && <p className="text-xs text-muted mt-1 line-clamp-2">{o.message}</p>}
                        {o.firm.responseMedianMin != null && (
                          <p className="text-xs text-green-700 mt-1">⚡ ~{Math.round(o.firm.responseMedianMin / 60)} sa yanıt</p>
                        )}
                        <div className="mt-3">
                          {o.reservation ? (
                            <Link href={`/hesabim/rezervasyon/${o.reservation.id}`} className="btn btn-outline w-full text-sm">
                              Rezervasyonu gör
                            </Link>
                          ) : accepted ? (
                            <span className="text-xs text-muted">Başka teklif kabul edildi</span>
                          ) : (
                            <AcceptOfferButton offerId={o.id} price={o.price} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    OPEN: { label: "Açık", cls: "bg-blue-50 text-blue-700" },
    MATCHED: { label: "Firmalara iletildi", cls: "bg-amber-50 text-amber-700" },
    CLOSED: { label: "Rezerve edildi", cls: "bg-green-50 text-green-700" },
    EXPIRED: { label: "Süresi doldu", cls: "bg-gray-100 text-gray-600" },
  };
  const s = map[status] ?? map.OPEN!;
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
