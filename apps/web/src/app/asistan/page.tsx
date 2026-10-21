import Link from "next/link";
import { formatTRY } from "@dugun38/core";

export const metadata = { title: "AI Düğün Asistanı" };

const BUDGET = 350000;

const breakdown = [
  { label: "Mekan & Yemek", pct: 65, icon: "🏛️" },
  { label: "Gelinlik & Damatlık", pct: 9, icon: "👰" },
  { label: "Fotoğraf & Video", pct: 8, icon: "📷" },
  { label: "Müzik & Orkestra", pct: 5, icon: "🎶" },
  { label: "Süsleme & Çiçek", pct: 4, icon: "💐" },
  { label: "Diğer", pct: 9, icon: "✨" },
];

export default function AsistanPage() {
  return (
    <div className="container-x py-10">
      <div className="max-w-3xl">
        <span className="badge bg-brand-50 text-brand-700 mb-4">Yakında</span>
        <h1 className="text-3xl font-bold text-ink">AI Düğün Asistanı</h1>
        <p className="text-muted leading-relaxed mt-2">
          Bütçenizi, ilçenizi ve düğün tarzınızı girin; AI Düğün Asistanı Kayseri&apos;deki
          gerçek firmalardan size özel öneriler sunsun. Bütçenizi kalemlere dağıtsın,
          yapılacaklar listenizi hazırlasın. Düğün planlamak hiç bu kadar kolay olmamıştı.
        </p>
        <div className="card p-6 mt-4 bg-cream">
          <p className="text-muted leading-relaxed text-sm">
            Şu an yapay zekâ bağlantısı hazırlanıyor; asistan çok yakında aktif olacak.
            Aşağıda nasıl çalışacağını ve örnek bir bütçe dağılımını görebilirsiniz.
          </p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-ink mt-8 mb-2">Asistan ne yapacak?</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <div className="card p-6">
          <div className="text-3xl">🎯</div>
          <div className="font-bold text-ink mt-3">Firma önerisi</div>
          <p className="text-muted leading-relaxed mt-2 text-sm">
            Bütçe + ilçe + tarz girince Kayseri&apos;deki gerçek firmalardan size uygun olanları listeler.
          </p>
        </div>
        <div className="card p-6">
          <div className="text-3xl">📊</div>
          <div className="font-bold text-ink mt-3">Bütçe dağılımı</div>
          <p className="text-muted leading-relaxed mt-2 text-sm">
            Toplam bütçenizi mekandan müziğe kalemlere böler; nereye ne kadar ayıracağınızı gösterir.
          </p>
        </div>
        <div className="card p-6">
          <div className="text-3xl">✅</div>
          <div className="font-bold text-ink mt-3">Yapılacaklar listesi</div>
          <p className="text-muted leading-relaxed mt-2 text-sm">
            Düğün tarihine göre adım adım yapılacaklar listesi ve hatırlatmalar üretir.
          </p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-ink mt-8 mb-2">Örnek bütçe dağılımı</h2>
      <p className="text-muted leading-relaxed mt-2">
        {formatTRY(BUDGET)} toplam bütçe için örnek dağılım:
      </p>
      <div className="card p-0 mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink">
              <th className="p-3 font-semibold">Kalem</th>
              <th className="p-3 font-semibold">Oran</th>
              <th className="p-3 font-semibold">Tutar</th>
            </tr>
          </thead>
          <tbody className="text-muted">
            {breakdown.map((b) => (
              <tr key={b.label} className="border-b border-line">
                <td className="p-3 font-medium text-ink">{b.icon} {b.label}</td>
                <td className="p-3">%{b.pct}</td>
                <td className="p-3">{formatTRY(Math.round((BUDGET * b.pct) / 100))}</td>
              </tr>
            ))}
            <tr className="font-semibold text-ink">
              <td className="p-3">Toplam</td>
              <td className="p-3">%100</td>
              <td className="p-3">{formatTRY(BUDGET)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-muted leading-relaxed mt-2 text-sm">
        Oranlar örnektir; asistan sizin tarzınıza ve ilçenize göre dağılımı kişiselleştirir.
      </p>

      <div className="mt-8">
        <Link href="/teklif-al" className="btn btn-primary">Şimdi teklif al</Link>
      </div>
    </div>
  );
}
