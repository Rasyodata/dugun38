import { prisma } from "@dugun38/db";
import { formatTRY } from "@dugun38/core";
import { ResolveDisputeButtons } from "@/components/ResolveDisputeButtons";

export const metadata = { title: "Yönetim · Özet" };

export default async function AdminOverviewPage() {
  const [users, firms, requests, reservations, disputes, gmv, recentLogs] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.firmProfile.count(),
    prisma.offerRequest.count(),
    prisma.reservation.count(),
    prisma.reservation.findMany({
      where: { status: "DISPUTED" },
      include: { firm: { select: { businessName: true } }, couple: { select: { name: true } } },
    }),
    prisma.reservation.aggregate({ where: { status: "COMPLETED" }, _sum: { totalAmount: true, commissionAmount: true } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { user: { select: { name: true, role: true } } } }),
  ]);

  return (
    <div>
      <h2 className="text-lg font-bold text-ink mb-3">Özet</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Stat label="Kullanıcı" value={String(users)} />
        <Stat label="Firma" value={String(firms)} />
        <Stat label="Teklif talebi" value={String(requests)} />
        <Stat label="Rezervasyon" value={String(reservations)} />
        <Stat label="İşlem hacmi (GMV)" value={formatTRY(gmv._sum.totalAmount ?? 0)} />
        <Stat label="Komisyon geliri" value={formatTRY(gmv._sum.commissionAmount ?? 0)} accent />
      </div>

      <h2 className="text-lg font-bold text-ink mt-8 mb-3">Bekleyen itirazlar ({disputes.length})</h2>
      {disputes.length === 0 ? (
        <p className="text-muted text-sm">Bekleyen itiraz yok. 🎉</p>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <div key={d.id} className="card p-4 border-amber-200 bg-amber-50">
              <div className="flex justify-between">
                <span className="font-medium text-ink">{d.couple.name} ↔ {d.firm.businessName}</span>
                <span className="text-ink font-semibold">{formatTRY(d.depositAmount)} kaparo</span>
              </div>
              <p className="text-sm text-amber-800 mt-1">“{d.disputeReason}”</p>
              <ResolveDisputeButtons id={d.id} />
            </div>
          ))}
        </div>
      )}

      <h2 className="text-lg font-bold text-ink mt-8 mb-3">Son hareketler</h2>
      <div className="card divide-y divide-line">
        {recentLogs.map((l) => (
          <div key={l.id} className="px-4 py-2.5 text-sm flex items-center justify-between gap-3">
            <span className="text-ink"><code className="text-brand-700">{l.action}</code> — {l.user?.name ?? "sistem"}</span>
            <span className="text-xs text-muted shrink-0">{new Date(l.createdAt).toLocaleString("tr-TR")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`card p-4 ${accent ? "border-brand-300 bg-brand-50" : ""}`}>
      <p className="text-xl font-bold text-ink">{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}
