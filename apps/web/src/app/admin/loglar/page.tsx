import Link from "next/link";
import { prisma } from "@dugun38/db";

export const metadata = { title: "Yönetim · Kullanıcı Logları" };

const ACTION_LABELS: Record<string, string> = {
  "auth.register": "Kayıt",
  "auth.login": "Giriş",
  "auth.login_failed": "Başarısız giriş",
  "auth.login_locked": "Hesap kilidi",
  "auth.demo_login": "Demo giriş",
  "offer_request.create": "Teklif talebi",
  "offer.create": "Teklif verme",
  "offer.accept": "Teklif kabul",
  "reservation.deposit_held": "Kaparo ödendi",
  "reservation.completed": "Rezervasyon tamam",
  "reservation.disputed": "İtiraz açıldı",
  "review.create": "Yorum",
  "firm.profile_save": "Firma profil kaydı",
  "admin.dispute_resolved": "İtiraz kararı",
  "account.deleted": "Hesap silme",
  "admin.firm_verify": "Firma doğrulama",
  "admin.firm_showcase": "Vitrin değişimi",
};

const PAGE_SIZE = 50;

export default async function LoglarPage({ searchParams }: PageProps<"/admin/loglar">) {
  const sp = await searchParams;
  const action = typeof sp.action === "string" ? sp.action : "";
  const page = Math.max(1, Number(sp.page) || 1);

  const where = action ? { action } : {};
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { name: true, role: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);
  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <h2 className="text-lg font-bold text-ink">Kullanıcı Logları</h2>
        <span className="text-xs text-muted">{total} kayıt</span>
      </div>

      {/* Filtre */}
      <form className="flex flex-wrap gap-2 mb-4" action="/admin/loglar">
        <select name="action" defaultValue={action} className="input max-w-xs">
          <option value="">Tüm işlemler</option>
          {Object.entries(ACTION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button className="btn btn-outline text-sm" type="submit">Filtrele</button>
        {action && <Link href="/admin/loglar" className="btn btn-outline text-sm">Temizle</Link>}
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted border-b border-line">
              <th className="px-3 py-2 font-medium">Zaman</th>
              <th className="px-3 py-2 font-medium">İşlem</th>
              <th className="px-3 py-2 font-medium">Kullanıcı</th>
              <th className="px-3 py-2 font-medium">IP</th>
              <th className="px-3 py-2 font-medium">Detay</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-line last:border-0 align-top">
                <td className="px-3 py-2 whitespace-nowrap text-xs text-muted">{new Date(l.createdAt).toLocaleString("tr-TR")}</td>
                <td className="px-3 py-2">
                  <span className="badge bg-brand-50 text-brand-700">{ACTION_LABELS[l.action] ?? l.action}</span>
                </td>
                <td className="px-3 py-2">
                  {l.user ? (
                    <span className="text-ink">{l.user.name} <span className="text-muted text-xs">({l.user.role})</span></span>
                  ) : (
                    <span className="text-muted">sistem</span>
                  )}
                </td>
                <td className="px-3 py-2 text-xs text-muted">{l.ip ?? "—"}</td>
                <td className="px-3 py-2 text-xs text-muted max-w-xs truncate">{l.meta ?? "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-muted">Kayıt yok.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sayfalama */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 text-sm">
          {page > 1 && <Link href={`/admin/loglar?action=${action}&page=${page - 1}`} className="btn btn-outline text-sm">← Önceki</Link>}
          <span className="text-muted">Sayfa {page} / {pages}</span>
          {page < pages && <Link href={`/admin/loglar?action=${action}&page=${page + 1}`} className="btn btn-outline text-sm">Sonraki →</Link>}
        </div>
      )}
    </div>
  );
}
