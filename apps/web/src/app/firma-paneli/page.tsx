import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@dugun38/db";
import { CATEGORY_BY_SLUG, formatTRY, calcCommission } from "@dugun38/core";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Firma Paneli" };

export default async function FirmaPaneliPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  if (user.role !== "FIRM") redirect("/");

  const firm = await prisma.firmProfile.findUnique({ where: { userId: user.id } });
  if (!firm) {
    return (
      <div className="container-x py-12 max-w-lg text-center">
        <h1 className="text-2xl font-bold text-ink">Firma profilinizi oluşturun</h1>
        <p className="text-muted mt-2">Talep almaya başlamak için profilinizi tamamlayın. Ücretsiz.</p>
        <Link href="/firma-paneli/profil?yeni=1" className="btn btn-primary mt-6 inline-flex">Profili Oluştur</Link>
      </div>
    );
  }

  const [openRequests, offersSent, reservations] = await Promise.all([
    prisma.offerRequest.count({
      where: { categorySlug: firm.categorySlug, status: { in: ["OPEN", "MATCHED"] }, districtSlug: { in: (await prisma.firmDistrict.findMany({ where: { firmId: firm.id }, select: { districtSlug: true } })).map((d) => d.districtSlug) } },
    }),
    prisma.offer.count({ where: { firmId: firm.id } }),
    prisma.reservation.findMany({ where: { firmId: firm.id }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const cat = CATEGORY_BY_SLUG[firm.categorySlug];
  const earned = reservations.filter((r) => r.status === "COMPLETED").reduce((s, r) => s + (r.totalAmount - r.commissionAmount), 0);

  return (
    <div className="container-x py-8 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{firm.businessName}</h1>
          <p className="text-muted text-sm">{cat?.icon} {cat?.name} · ★ {firm.ratingAvg.toFixed(1)} ({firm.ratingCount})</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/firma/${firm.slug}`} className="btn btn-outline text-sm">Profilimi gör</Link>
          <Link href="/firma-paneli/profil" className="btn btn-outline text-sm">Düzenle</Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-4 mt-6">
        <Stat label="Açık talep" value={String(openRequests)} href="/firma-paneli/talepler" accent />
        <Stat label="Gönderilen teklif" value={String(offersSent)} />
        <Stat label="Rezervasyon" value={String(reservations.length)} />
        <Stat label="Net kazanç" value={formatTRY(earned)} />
      </div>

      <div className="card p-5 mt-6 bg-brand-50 border-brand-200">
        <h2 className="font-semibold text-ink">💡 Komisyon modeli</h2>
        <p className="text-sm text-muted mt-1">
          Profil tamamen ücretsiz. Yalnızca platform üzerinden rezervasyon kazandığınızda <strong>%2 komisyon</strong> ödersiniz.
          Örneğin {formatTRY(300000)}'lik bir rezervasyonda komisyon {formatTRY(calcCommission(300000))}.
        </p>
      </div>

      <h2 className="text-lg font-bold text-ink mt-8 mb-3">Son rezervasyonlar</h2>
      {reservations.length === 0 ? (
        <p className="text-muted text-sm">Henüz rezervasyon yok. <Link href="/firma-paneli/talepler" className="text-brand-700 hover:underline">Açık talepleri gör →</Link></p>
      ) : (
        <div className="space-y-2">
          {reservations.map((r) => (
            <div key={r.id} className="card p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-ink">{formatTRY(r.totalAmount)}</p>
                <p className="text-xs text-muted">{new Date(r.eventDate).toLocaleDateString("tr-TR")}</p>
              </div>
              <span className="badge bg-brand-50 text-brand-700">{r.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, href, accent }: { label: string; value: string; href?: string; accent?: boolean }) {
  const inner = (
    <div className={`card p-4 ${accent ? "border-brand-300 bg-brand-50" : ""}`}>
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
