import Link from "next/link";
import { prisma } from "@dugun38/db";
import { CATEGORY_BY_SLUG, formatTRY } from "@dugun38/core";
import { FirmAdminToggle } from "@/components/FirmAdminToggle";

export const metadata = { title: "Yönetim · Firmalar" };

export default async function AdminFirmalarPage() {
  const firms = await prisma.firmProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, deletedAt: true } },
      _count: { select: { offers: true, reservations: true, reviews: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-ink">Firmalar</h2>
        <span className="text-xs text-muted">{firms.length} firma</span>
      </div>
      <div className="space-y-3">
        {firms.map((f) => (
          <div key={f.id} className="card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link href={`/firma/${f.slug}`} className="font-semibold text-ink hover:text-brand-700">{f.businessName}</Link>
                <p className="text-xs text-muted">{CATEGORY_BY_SLUG[f.categorySlug]?.name} · {f.user.email}</p>
                <p className="text-xs text-muted mt-1">
                  ★ {f.ratingAvg.toFixed(1)} ({f.ratingCount}) · {f._count.offers} teklif · {f._count.reservations} rezervasyon
                  {f.minPrice ? ` · ${formatTRY(f.minPrice)}+` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <FirmAdminToggle id={f.id} field="verified" initial={f.verified} label="Doğrulanmış" />
                <FirmAdminToggle id={f.id} field="showcase" initial={f.showcase} label="Vitrin" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
