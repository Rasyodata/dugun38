import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@dugun38/db";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Hesabım" };

export default async function HesabimPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  if (user.role === "FIRM") redirect("/firma-paneli");
  if (user.role === "ADMIN") redirect("/admin");

  const [requestCount, offerCount, reservationCount, favCount] = await Promise.all([
    prisma.offerRequest.count({ where: { coupleId: user.id } }),
    prisma.offer.count({ where: { request: { coupleId: user.id } } }),
    prisma.reservation.count({ where: { coupleId: user.id } }),
    prisma.favorite.count({ where: { coupleId: user.id } }),
  ]);

  const tiles = [
    { href: "/teklif-al", icon: "📨", title: "Teklif Al", desc: "Tek formla firmalardan fiyat iste" },
    { href: "/hesabim/tekliflerim", icon: "📋", title: "Tekliflerim", desc: `${requestCount} talep · ${offerCount} teklif` },
    { href: "/hesabim/araclar", icon: "🛠️", title: "Düğün Araçlarım", desc: "Ajanda, bütçe, davetli listesi" },
    { href: "/favoriler", icon: "❤️", title: "Favorilerim", desc: `${favCount} firma` },
  ];

  return (
    <div className="container-x py-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-ink">Merhaba, {user.name} 👋</h1>
      <p className="text-muted mt-1">Düğün planlamanızı buradan yönetin.</p>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className="card p-5 hover:border-brand-400 hover:shadow-sm transition">
            <div className="text-3xl">{t.icon}</div>
            <h2 className="font-semibold text-ink mt-2">{t.title}</h2>
            <p className="text-sm text-muted mt-0.5">{t.desc}</p>
          </Link>
        ))}
      </div>

      {reservationCount > 0 && (
        <div className="card p-5 mt-6 bg-brand-50 border-brand-200">
          <p className="font-medium text-ink">🔒 {reservationCount} rezervasyonunuz var</p>
          <Link href="/hesabim/tekliflerim" className="text-sm text-brand-700 hover:underline">Rezervasyonları gör →</Link>
        </div>
      )}

      <div className="mt-8 text-sm">
        <Link href="/hesabim/ayarlar" className="text-muted hover:text-brand-700">Hesap ayarları ve KVKK (hesap silme) →</Link>
      </div>
    </div>
  );
}
