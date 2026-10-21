import Link from "next/link";

export const metadata = { title: "Gizlilik Politikası" };

export default function GizlilikPage() {
  return (
    <div className="container-x py-10">
      <div className="max-w-3xl">
        <span className="badge bg-brand-50 text-brand-700 mb-4">Yasal</span>
        <h1 className="text-3xl font-bold text-ink">Gizlilik Politikası</h1>

        <div className="card p-6 mt-4 bg-cream">
          <p className="text-muted leading-relaxed">
            Bu metin bilgilendirme amaçlıdır; yayından önce avukat onayından geçecektir.
          </p>
        </div>

        <p className="text-muted leading-relaxed mt-4">
          Düğün38 olarak gizliliğinize önem veriyoruz. Bu politika, Kayseri&apos;nin 16
          ilçesinde hizmet veren platformumuzu kullandığınızda hangi verileri topladığımızı
          ve bu verileri nasıl koruduğumuzu açıklar.
        </p>

        <h2 className="text-xl font-bold text-ink mt-8 mb-2">Topladığımız Veriler</h2>
        <ul className="list-disc pl-6 text-muted leading-relaxed mt-2 space-y-1">
          <li>Hesap bilgileri: ad-soyad, e-posta, telefon numarası ve şifre (şifrelenmiş olarak)</li>
          <li>Teklif ve rezervasyon verileri: düğün tarihi, ilçe, bütçe, kategori tercihleri, mesajlar</li>
          <li>Teknik veriler: oturum çerezi, IP adresi, tarayıcı bilgisi ve log kayıtları</li>
        </ul>

        <h2 className="text-xl font-bold text-ink mt-8 mb-2">Çerezler</h2>
        <p className="text-muted leading-relaxed mt-2">
          Oturumunuzu sürdürmek ve platformu iyileştirmek için zorunlu ve analitik çerezler
          kullanırız. Çerezlerin ayrıntısı için{" "}
          <Link href="/cerez" className="text-brand-700 hover:underline">Çerez Politikası</Link>{" "}
          sayfamıza bakabilirsiniz.
        </p>

        <h2 className="text-xl font-bold text-ink mt-8 mb-2">Üçüncü Taraflar</h2>
        <p className="text-muted leading-relaxed mt-2">
          Hizmetin sunulabilmesi için verilerinizi yalnızca gerekli ölçüde paylaşırız:
        </p>
        <ul className="list-disc pl-6 text-muted leading-relaxed mt-2 space-y-1">
          <li><strong className="text-ink">Ödeme kuruluşu:</strong> Güvenli Kaparo işlemleri lisanslı ödeme kuruluşu (iyzico Pazaryeri) üzerinden yürütülür. Kart bilgileriniz Düğün38 sunucularında saklanmaz.</li>
          <li><strong className="text-ink">SMS sağlayıcı:</strong> Teklif ve rezervasyon bildirimleri için telefon numaranız SMS hizmet sağlayıcımızla paylaşılır.</li>
          <li><strong className="text-ink">Firmalar:</strong> Teklif talebinizi iletebilmek için ad, iletişim ve talep bilgileriniz ilgili firmaya aktarılır.</li>
        </ul>

        <h2 className="text-xl font-bold text-ink mt-8 mb-2">Güvenlik Önlemleri</h2>
        <ul className="list-disc pl-6 text-muted leading-relaxed mt-2 space-y-1">
          <li>Şifreleriniz geri döndürülemez biçimde şifrelenerek (hash) saklanır</li>
          <li>Oturum bilgileriniz <code className="text-brand-700">httpOnly</code> çerezlerde tutulur; tarayıcı tarafı betiklerle okunamaz</li>
          <li>Tüm veri aktarımı HTTPS/TLS ile şifrelenir</li>
          <li>Erişim yetkileri rol bazlı olarak sınırlandırılır</li>
        </ul>

        <h2 className="text-xl font-bold text-ink mt-8 mb-2">İletişim</h2>
        <p className="text-muted leading-relaxed mt-2">
          Gizlilikle ilgili sorularınız için{" "}
          <a href="mailto:destek@dugun38.com" className="text-brand-700 hover:underline">destek@dugun38.com</a>{" "}
          adresinden bize ulaşabilirsiniz. Verilerinizin işlenmesine ilişkin haklarınız için{" "}
          <Link href="/kvkk" className="text-brand-700 hover:underline">KVKK Aydınlatma Metni</Link>&apos;ni inceleyin.
        </p>
      </div>
    </div>
  );
}
