import Link from "next/link";

export const metadata = { title: "Kullanım Koşulları" };

export default function KullanimKosullariPage() {
  return (
    <div className="container-x py-10">
      <div className="max-w-3xl">
        <span className="badge bg-brand-50 text-brand-700 mb-4">Yasal</span>
        <h1 className="text-3xl font-bold text-ink">Kullanım Koşulları</h1>

        <div className="card p-6 mt-4 bg-cream">
          <p className="text-muted leading-relaxed">
            Bu metin bilgilendirme amaçlıdır; yayından önce avukat onayından geçecektir.
          </p>
        </div>

        <p className="text-muted leading-relaxed mt-4">
          Duviora platformunu kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.
          Platform, Kayseri&apos;nin 16 ilçesinde çiftler ile düğün hizmeti veren firmaları
          buluşturan bir pazar yeridir.
        </p>

        <h2 className="text-xl font-bold text-ink mt-8 mb-2">1. Platformun Rolü (Aracı)</h2>
        <p className="text-muted leading-relaxed mt-2">
          Duviora yalnızca çiftler ile firmaları buluşturan bir <strong className="text-ink">aracı
          platformdur</strong>. Hizmetin bizzat sağlayıcısı değildir; mekan, catering,
          fotoğraf gibi hizmetler ilgili firmalar tarafından sunulur. Sözleşme çift ile
          firma arasında kurulur.
        </p>

        <h2 className="text-xl font-bold text-ink mt-8 mb-2">2. Çiftlerin Yükümlülükleri</h2>
        <ul className="list-disc pl-6 text-muted leading-relaxed mt-2 space-y-1">
          <li>Teklif ve rezervasyon bilgilerini doğru ve güncel vermek</li>
          <li>Platform üzerinden aldıkları hizmetlerde iyi niyet kurallarına uymak</li>
          <li>Güvenli Kaparo ve ödeme süreçlerinde belirlenen kurallara uymak</li>
        </ul>
        <p className="text-muted leading-relaxed mt-2">
          Çiftlerden platform kullanımı için <strong className="text-ink">hiçbir ücret veya
          komisyon alınmaz.</strong>
        </p>

        <h2 className="text-xl font-bold text-ink mt-8 mb-2">3. Firmaların Yükümlülükleri</h2>
        <ul className="list-disc pl-6 text-muted leading-relaxed mt-2 space-y-1">
          <li>Profil, fiyat ve hizmet bilgilerini doğru ve güncel tutmak</li>
          <li>Kabul edilen teklifleri ve rezervasyonları taahhüt ettikleri şekilde yerine getirmek</li>
          <li>Tüketici mevzuatı ve ilgili yasal düzenlemelere uymak</li>
        </ul>

        <h2 className="text-xl font-bold text-ink mt-8 mb-2">4. Yorum Kuralları</h2>
        <p className="text-muted leading-relaxed mt-2">
          Değerlendirmelerin gerçekçi olması için{" "}
          <strong className="text-ink">yalnızca ilgili firmadan platform üzerinden rezervasyon
          yapan çiftler yorum yazabilir.</strong> Hakaret, yanıltıcı veya alakasız içerikler
          kaldırılabilir.
        </p>

        <h2 className="text-xl font-bold text-ink mt-8 mb-2">5. Komisyon</h2>
        <p className="text-muted leading-relaxed mt-2">
          Firmalar için platform kullanımı ücretsiz profil ile başlar. Duviora, yalnızca
          gerçekleşen rezervasyonlar üzerinden <strong className="text-ink">%2 komisyon</strong>{" "}
          alır. İsteğe bağlı vitrin paketi ile firmalar öne çıkarma hizmeti satın alabilir.
          Çiftlerden komisyon alınmaz.
        </p>

        <h2 className="text-xl font-bold text-ink mt-8 mb-2">6. Sorumluluğun Reddi</h2>
        <p className="text-muted leading-relaxed mt-2">
          Duviora aracı konumda olduğundan, firmaların sunduğu hizmetin kalitesi, ifası ve
          firma ile çift arasındaki sözleşmeden doğrudan sorumlu değildir. Uyuşmazlıklarda
          Güvenli Kaparo süreci kapsamında arabuluculuk sağlanır; itiraz hâlinde admin
          değerlendirme yapar. Güvenli Kaparo ayrıntıları için{" "}
          <Link href="/guvenli-kaparo" className="text-brand-700 hover:underline">bu sayfaya</Link> bakın.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/kvkk" className="text-brand-700 hover:underline">KVKK</Link>
          <Link href="/gizlilik" className="text-brand-700 hover:underline">Gizlilik Politikası</Link>
          <Link href="/cerez" className="text-brand-700 hover:underline">Çerez Politikası</Link>
        </div>
      </div>
    </div>
  );
}
