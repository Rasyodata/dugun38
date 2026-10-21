import Link from "next/link";
import { prisma, type Prisma } from "@dugun38/db";

export const metadata = { title: "Yönetim · Kullanıcılar" };

const ROLE_LABEL: Record<string, string> = { COUPLE: "Çift", FIRM: "Firma", ADMIN: "Yönetici" };

export default async function AdminKullanicilarPage({ searchParams }: PageProps<"/admin/kullanicilar">) {
  const sp = await searchParams;
  const role = typeof sp.role === "string" ? sp.role : "";

  const where: Prisma.UserWhereInput = role ? { role } : {};
  const [users, counts] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        firm: { select: { slug: true } },
        _count: { select: { offerRequests: true, reservations: true, auditLogs: true } },
      },
    }),
    prisma.user.groupBy({ by: ["role"], _count: true }),
  ]);
  const countFor = (r: string) => counts.find((c) => c.role === r)?._count ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-ink">Kullanıcılar</h2>
        <span className="text-xs text-muted">Çift {countFor("COUPLE")} · Firma {countFor("FIRM")} · Yönetici {countFor("ADMIN")}</span>
      </div>

      <div className="flex gap-2 mb-4">
        {["", "COUPLE", "FIRM", "ADMIN"].map((r) => (
          <Link
            key={r || "all"}
            href={r ? `/admin/kullanicilar?role=${r}` : "/admin/kullanicilar"}
            className={`badge border ${role === r ? "bg-brand-600 text-white border-brand-600" : "bg-white border-line text-ink"}`}
          >
            {r ? ROLE_LABEL[r] : "Tümü"}
          </Link>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted border-b border-line">
              <th className="px-3 py-2 font-medium">Ad</th>
              <th className="px-3 py-2 font-medium">E-posta</th>
              <th className="px-3 py-2 font-medium">Rol</th>
              <th className="px-3 py-2 font-medium">Kayıt</th>
              <th className="px-3 py-2 font-medium">Aktivite</th>
              <th className="px-3 py-2 font-medium">Durum</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-0">
                <td className="px-3 py-2 text-ink">
                  {u.firm ? <Link href={`/firma/${u.firm.slug}`} className="hover:text-brand-700">{u.name}</Link> : u.name}
                </td>
                <td className="px-3 py-2 text-muted text-xs">{u.email}</td>
                <td className="px-3 py-2"><span className="badge bg-brand-50 text-brand-700">{ROLE_LABEL[u.role] ?? u.role}</span></td>
                <td className="px-3 py-2 text-xs text-muted whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString("tr-TR")}</td>
                <td className="px-3 py-2 text-xs text-muted">{u._count.offerRequests} talep · {u._count.reservations} rez · {u._count.auditLogs} log</td>
                <td className="px-3 py-2">
                  {u.deletedAt ? <span className="badge bg-gray-100 text-gray-500">Silinmiş</span> : <span className="badge bg-green-50 text-green-700">Aktif</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
