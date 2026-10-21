import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@dugun38/db";
import { formatTRY, DEPOSIT_RELEASE_DAYS_AFTER_EVENT } from "@dugun38/core";
import { getCurrentUser } from "@/lib/auth";
import { ReservationActions } from "@/components/ReservationActions";

export const metadata = { title: "Rezervasyon" };

const STATUS_LABEL: Record<string, string> = {
  PENDING_DEPOSIT: "Kaparo bekleniyor",
  DEPOSIT_HELD: "Kaparo güvende (ödeme kuruluşunda)",
  COMPLETED: "Tamamlandı",
  DISPUTED: "İtiraz incelemede",
  REFUNDED: "İade edildi",
  CANCELLED: "İptal",
};

export default async function RezervasyonPage({ params }: PageProps<"/hesabim/rezervasyon/[id]">) {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  const { id } = await params;

  const r = await prisma.reservation.findUnique({
    where: { id },
    include: { firm: { select: { businessName: true, slug: true, publicPhone: true } }, deposit: true, review: true },
  });
  if (!r || r.coupleId !== user.id) notFound();

  const steps = ["PENDING_DEPOSIT", "DEPOSIT_HELD", "COMPLETED"];
  const activeIdx = steps.indexOf(r.status === "DISPUTED" ? "DEPOSIT_HELD" : r.status);

  return (
    <div className="container-x py-8 max-w-2xl">
      <nav className="text-sm text-muted mb-2"><Link href="/hesabim/tekliflerim" className="hover:text-brand-700">← Tekliflerim</Link></nav>
      <h1 className="text-2xl font-bold text-ink">Rezervasyon</h1>
      <Link href={`/firma/${r.firm.slug}`} className="text-brand-700 hover:underline">{r.firm.businessName}</Link>

      {/* Durum adımları */}
      <div className="flex items-center gap-2 mt-5">
        {["Kaparo", "Güvende", "Tamamlandı"].map((label, i) => (
          <div key={label} className="flex-1 flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i <= activeIdx ? "bg-brand-600 text-white" : "bg-line text-muted"}`}>{i + 1}</div>
            <span className={`text-xs ${i <= activeIdx ? "text-ink font-medium" : "text-muted"}`}>{label}</span>
          </div>
        ))}
      </div>

      <div className="card p-5 mt-5">
        <Row label="Durum" value={STATUS_LABEL[r.status] ?? r.status} />
        <Row label="Etkinlik tarihi" value={new Date(r.eventDate).toLocaleDateString("tr-TR")} />
        <Row label="Toplam tutar" value={formatTRY(r.totalAmount)} />
        <Row label="Kaparo (%20)" value={formatTRY(r.depositAmount)} />
        <Row label="Platform komisyonu (%2)" value={formatTRY(r.commissionAmount)} muted />
        {r.deposit && <Row label="Kaparo durumu" value={r.deposit.status === "HELD" ? "Ödeme kuruluşunda tutuluyor" : r.deposit.status === "RELEASED" ? "Firmaya aktarıldı" : "İade edildi"} />}
      </div>

      {r.status === "DISPUTED" && (
        <div className="card p-4 mt-4 bg-amber-50 border-amber-200 text-sm">
          <p className="font-semibold text-amber-800">İtirazınız inceleniyor</p>
          <p className="text-amber-700 mt-1">“{r.disputeReason}” — Admin ekibimiz karar verene kadar kaparo güvende tutulur.</p>
        </div>
      )}

      <div className="mt-5">
        <ReservationActions id={r.id} status={r.status as never} hasReview={Boolean(r.review)} />
      </div>

      <p className="text-xs text-muted mt-4 bg-cream rounded p-3">
        🔒 Kaparonuz lisanslı ödeme kuruluşunda (iyzico Pazaryeri) tutulur. Hizmeti aldığınızı onayladığınızda ya da
        düğün tarihinden {DEPOSIT_RELEASE_DAYS_AFTER_EVENT} gün sonra itiraz yoksa firmaya aktarılır.
        <strong> Not: ödeme entegrasyonu şu an test modundadır.</strong>
      </p>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted">{label}</span>
      <span className={muted ? "text-muted" : "text-ink font-medium"}>{value}</span>
    </div>
  );
}
