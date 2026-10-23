import Link from "next/link";

export const metadata = { title: "KVKK Aydınlatma Metni" };

export default function KvkkPage() {
  return (
    <div className="container-x py-10">
      <div className="max-w-3xl">
        <span className="badge bg-brand-50 text-brand-700 mb-4">Yasal</span>
        <h1 className="text-3xl font-bold text-ink">KVKK Aydınlatma Metni</h1>

        <div className="card p-6 mt-4 bg-cream">
          <p className="text-muted leading-relaxed">
            Bu metin bilgilendirme amaçlıdır; yayından önce avukat onayından geçecektir.
          </p>
        </div>

        <p className="text-muted leading-relaxed mt-4">
          6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;) kapsamında,
          kişisel verilerinizin veri sorumlusu sıfatıyla Duviora tarafından nasıl
          işlendiği hakkında sizi bilgilendirmek isteriz.
        </p>

        <h2 className="text-xl font-bold text-ink mt-8 mb-2">1. Veri Sorumlusu</h2>
        <p className="text-muted leading-relaxed mt-2">
          Kişisel verileriniz, Kayseri&apos;nin 16 ilçesinde düğün hizmetlerini çiftler ile
          firmaları buluşturan aracı platform olan <strong className="text-ink">Duviora</strong> tarafından,
          veri sorumlusu sıfatıyla işlenmektedir.
        </p>

        <h2 className="text-xl font-bold text-ink mt-8 mb-2">2. İşlenen Kişisel Veriler</h2>
        <ul className="list-disc pl-6 text-muted leading-relaxed mt-2 space-y-1">
          <li>Kimlik ve iletişim verileri: ad-soyad, e-posta adresi, telefon numarası</li>
          <li>Talep bilgileri: düğün tarihi, ilçe, bütçe aralığı, kategori ve firma tercihleri, mesaj içerikleri</li>
          <li>İşlem güvenliği verileri: oturum bilgileri, IP adresi, log kayıtları</li>
        </ul>

        <h2 className="text-xl font-bold text-ink mt-8 mb-2">3. İşleme Amaçları</h2>
        <ul className="list-disc pl-6 text-muted leading-relaxed mt-2 space-y-1">
          <li>Teklif taleplerinizin ilgili firmalara iletilmesi ve yanıtların size ulaştırılması</li>
          <li>Rezervasyon ve Güvenli Kaparo süreçlerinin yürütülmesi</li>
          <li>Hesabınızın oluşturulması, oturum yönetimi ve platform güvenliğinin sağlanması</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi ve talep/şikâyetlerin çözümü</li>
        </ul>

        <h2 className="text-xl font-bold text-ink mt-8 mb-2">4. Hukuki Sebep</h2>
        <p className="text-muted leading-relaxed mt-2">
          Verileriniz; bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması
          (KVKK md.5/2-c), hukuki yükümlülüğün yerine getirilmesi (md.5/2-ç), meşru
          menfaat (md.5/2-f) ve gerekli hâllerde açık rızanız (md.5/1) hukuki sebeplerine
          dayanılarak işlenir.
        </p>

        <h2 className="text-xl font-bold text-ink mt-8 mb-2">5. Saklama Süresi</h2>
        <p className="text-muted leading-relaxed mt-2">
          Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve ilgili
          mevzuatta öngörülen zamanaşımı süreleri kadar saklanır; bu sürelerin sona
          ermesiyle silinir, yok edilir veya anonim hâle getirilir.
        </p>

        <h2 className="text-xl font-bold text-ink mt-8 mb-2">6. Haklarınız (KVKK md.11)</h2>
        <p className="text-muted leading-relaxed mt-2">KVKK md.11 uyarınca şu haklara sahipsiniz:</p>
        <ul className="list-disc pl-6 text-muted leading-relaxed mt-2 space-y-1">
          <li>Kişisel verinizin işlenip işlenmediğini öğrenme ve buna ilişkin bilgi talep etme</li>
          <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Verilerin aktarıldığı üçüncü kişileri bilme</li>
          <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme</li>
          <li>Verilerin silinmesini veya yok edilmesini isteme</li>
          <li>İşlemenin kanuna aykırılığı hâlinde zararın giderilmesini talep etme</li>
        </ul>

        <h2 className="text-xl font-bold text-ink mt-8 mb-2">7. Başvuru Yolu</h2>
        <p className="text-muted leading-relaxed mt-2">
          Haklarınıza ilişkin taleplerinizi{" "}
          <a href="mailto:kvkk@dugun38.com" className="text-brand-700 hover:underline">kvkk@dugun38.com</a>{" "}
          adresine iletebilirsiniz. Başvurularınız en geç 30 gün içinde yanıtlanır.
        </p>

        <h2 className="text-xl font-bold text-ink mt-8 mb-2">8. Panelden Hesap Silme</h2>
        <p className="text-muted leading-relaxed mt-2">
          Dilediğiniz an{" "}
          <Link href="/hesabim" className="text-brand-700 hover:underline">hesabım</Link>{" "}
          panelinizden hesabınızı ve ilişkili kişisel verilerinizi doğrudan
          silebilirsiniz. Yasal saklama yükümlülüğü bulunan kayıtlar, süre sonuna kadar
          erişime kapalı olarak tutulur.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/gizlilik" className="text-brand-700 hover:underline">Gizlilik Politikası</Link>
          <Link href="/cerez" className="text-brand-700 hover:underline">Çerez Politikası</Link>
          <Link href="/kullanim-kosullari" className="text-brand-700 hover:underline">Kullanım Koşulları</Link>
        </div>
      </div>
    </div>
  );
}
