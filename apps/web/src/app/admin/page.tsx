import { redirect } from "next/navigation";
import { prisma } from "@dugun38/db";
import { formatTRY } from "@dugun38/core";
import { getCurrentUser } from "@/lib/auth";
import { ResolveDisputeButtons } from "@/components/ResolveDisputeButtons";

export const metadata = { title: "Yönetim Paneli" };

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  if (user.role !== "ADMIN") redirect("/");

  const [users, firms, requests, reservations, disputes, gmv] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.firmProfile.count(),
    prisma.offerRequest.count(),
    prisma.reservation.count(),
    prisma.reservation.findMany({
      where: { status: "DISPUTED" },
      include: { firm: { select: { businessName: true } }, couple: { select: { name: true } } },
    }),
    prisma.reservation.aggregate({ where: { status: "COMPLETED" }, _sum: { totalAmount: true, commissionAmount: true } }),
  ]);

  return (
    <div className="container-x py-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-ink">Yönetim Paneli</h1>

      <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
        <Stat label="Kullanıcı" value={String(users)} />
        <Stat label="Firma" value={String(firms)} />
        <Stat label="Talep" value={String(requests)} />
        <Stat label="Rezervasyon" value={String(reservations)} />
        <Stat label="Komisyon geliri" value={formatTRY(gmv._sum.commissionAmount ?? 0)} />
      </div>

      <h2 className="text-lg font-bold text-ink mt-8 mb-3">İtirazlar ({disputes.length})</h2>
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
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xl font-bold text-ink">{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}
