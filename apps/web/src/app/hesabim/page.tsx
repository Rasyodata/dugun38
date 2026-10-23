import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@dugun38/db";
import { getCurrentUser } from "@/lib/auth";
import { CoupleHero } from "@/components/CoupleHero";

export const metadata = { title: "Çiftimize Özel Panel" };

export default async function HesabimPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  if (user.role === "FIRM") redirect("/firma-paneli");
  if (user.role === "ADMIN") redirect("/admin");

  const [me, agenda, requestCount, offerCount, reservationCount, favCount, unread] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { name: true, weddingDate: true } }),
    prisma.agendaItem.findMany({ where: { coupleId: user.id }, orderBy: { sort: "asc" }, select: { title: true, done: true } }),
    prisma.offerRequest.count({ where: { coupleId: user.id } }),
    prisma.offer.count({ where: { request: { coupleId: user.id } } }),
    prisma.reservation.count({ where: { coupleId: user.id } }),
    prisma.favorite.count({ where: { coupleId: user.id } }),
    prisma.message.count({ where: { thread: { coupleId: user.id }, readAt: null, senderId: { not: user.id } } }),
  ]);

  const doneCount = agenda.filter((a) => a.done).length;
  const progress = agenda.length ? Math.round((doneCount / agenda.length) * 100) : 0;
  const nextStep = agenda.find((a) => !a.done)?.title ?? null;

  const tiles = [
    { href: "/teklif-al", icon: "📨", title: "Teklif Al", desc: "Tek formla firmalardan fiyat iste", accent: true },
    { href: "/hesabim/tekliflerim", icon: "📋", title: "Tekliflerim", desc: `${requestCount} talep · ${offerCount} teklif` },
    { href: "/mesajlar", icon: "💬", title: "Mesajlar", desc: unread > 0 ? `${unread} okunmamış mesaj` : "Firmalarla yazış" },
    { href: "/hesabim/araclar", icon: "🛠️", title: "Düğün Araçlarım", desc: `Plan %${progress} hazır` },
    { href: "/hesabim/davetliler", icon: "👥", title: "Davetli Listem", desc: "LCV ve WhatsApp davet" },
    { href: "/hesabim/dugun-sitem", icon: "💒", title: "Düğün Web Sitem", desc: "Paylaşılabilir davetiye" },
    { href: "/favoriler", icon: "❤️", title: "Favorilerim", desc: `${favCount} firma` },
    { href: "/asistan", icon: "✨", title: "AI Asistan", desc: "Bütçe & plan önerisi" },
    { href: "/kesfet", icon: "📖", title: "Düğün Rehberi", desc: "Kayseri'ye özel ipuçları" },
  ];

  return (
    <div className="container-x py-8 max-w-4xl">
      <CoupleHero name={me?.name ?? user.name} weddingDate={me?.weddingDate?.toISOString() ?? null} progress={progress} />

      {/* Sıradaki adım */}
      {nextStep && (
        <div className="card p-4 mt-5 flex items-center gap-3 bg-brand-50 border-brand-200">
          <span className="text-2xl">👉</span>
          <div className="flex-1">
            <p className="text-xs text-muted">Sıradaki adımınız</p>
            <p className="font-semibold text-ink">{nextStep}</p>
          </div>
          <Link href="/hesabim/araclar" className="btn btn-primary text-sm shrink-0">Ajandaya git</Link>
        </div>
      )}

      {/* Kısayollar */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href}
            className={`card p-5 hover:shadow-md hover:border-brand-400 transition ${t.accent ? "border-brand-300 bg-gradient-to-br from-brand-50 to-white" : ""}`}>
            <div className="text-3xl">{t.icon}</div>
            <h2 className="font-semibold text-ink mt-2">{t.title}</h2>
            <p className="text-sm text-muted mt-0.5">{t.desc}</p>
          </Link>
        ))}
      </div>

      {reservationCount > 0 && (
        <div className="card p-5 mt-6 bg-cream flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-ink">🔒 {reservationCount} rezervasyonunuz var</p>
            <p className="text-sm text-muted">Güvenli Kaparo ile koruma altında.</p>
          </div>
          <Link href="/hesabim/tekliflerim" className="btn btn-outline text-sm shrink-0">Rezervasyonlar</Link>
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-sm text-muted">Duviora ailesi olarak en özel gününüzde yanınızdayız 💕</p>
        <Link href="/hesabim/ayarlar" className="text-xs text-muted hover:text-brand-700 mt-1 inline-block">Hesap ayarları ve KVKK →</Link>
      </div>
    </div>
  );
}
