import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@dugun38/db";
import { CATEGORY_BY_SLUG, DISTRICT_BY_SLUG, formatTRY } from "@dugun38/core";
import { getCurrentUser } from "@/lib/auth";
import { SendOfferForm } from "@/components/SendOfferForm";

export const metadata = { title: "Gelen Talepler" };

export default async function TaleplerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  if (user.role !== "FIRM") redirect("/");

  const firm = await prisma.firmProfile.findUnique({
    where: { userId: user.id },
    include: { districts: { select: { districtSlug: true } } },
  });
  if (!firm) redirect("/firma-paneli");

  const districtSlugs = firm.districts.map((d) => d.districtSlug);
  const requests = await prisma.offerRequest.findMany({
    where: {
      categorySlug: firm.categorySlug,
      districtSlug: { in: districtSlugs },
      status: { in: ["OPEN", "MATCHED"] },
    },
    orderBy: { createdAt: "desc" },
    include: { offers: { where: { firmId: firm.id } } },
  });

  return (
    <div className="container-x py-8 max-w-3xl">
      <nav className="text-sm text-muted mb-2"><Link href="/firma-paneli" className="hover:text-brand-700">← Panel</Link></nav>
      <h1 className="text-2xl font-bold text-ink">Size uygun talepler</h1>
      <p className="text-muted text-sm mt-1">
        {CATEGORY_BY_SLUG[firm.categorySlug]?.name} · {districtSlugs.map((d) => DISTRICT_BY_SLUG[d]?.name).join(", ")}
      </p>

      {requests.length === 0 ? (
        <div className="card p-10 text-center mt-6">
          <p className="text-muted">Şu an açık talep yok. Yeni talep geldiğinde SMS ile bilgilendirileceksiniz.</p>
        </div>
      ) : (
        <div className="space-y-4 mt-6">
          {requests.map((r) => {
            const mine = r.offers[0];
            return (
              <div key={r.id} className="card p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-semibold text-ink">
                    {DISTRICT_BY_SLUG[r.districtSlug]?.name} · {r.guests ? `${r.guests} kişi` : "kişi sayısı belirtilmemiş"}
                  </h2>
                  <span className="text-xs text-muted">{new Date(r.eventDate).toLocaleDateString("tr-TR")}</span>
                </div>
                <p className="text-sm text-muted mt-1">
                  {r.budget ? `Bütçe: ${formatTRY(r.budget)}` : "Bütçe belirtilmemiş"}
                </p>
                {r.note && <p className="text-sm text-ink mt-2 bg-cream rounded p-2">“{r.note}”</p>}
                {mine ? (
                  <>
                    <p className="text-sm text-green-700 mt-3">✓ Teklifiniz: {formatTRY(mine.price)} ({mine.status})</p>
                    <SendOfferForm requestId={r.id} existingPrice={mine.price} />
                  </>
                ) : (
                  <SendOfferForm requestId={r.id} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
