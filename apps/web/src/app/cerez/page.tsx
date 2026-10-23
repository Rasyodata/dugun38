import Link from "next/link";

export const metadata = { title: "Çerez Politikası" };

export default function CerezPage() {
  return (
    <div className="container-x py-10">
      <div className="max-w-3xl">
        <span className="badge bg-brand-50 text-brand-700 mb-4">Yasal</span>
        <h1 className="text-3xl font-bold text-ink">Çerez Politikası</h1>

        <div className="card p-6 mt-4 bg-cream">
          <p className="text-muted leading-relaxed">
            Bu metin bilgilendirme amaçlıdır; yayından önce avukat onayından geçecektir.
          </p>
        </div>

        <p className="text-muted leading-relaxed mt-4">
          Duviora, platformun çalışması ve deneyiminizin iyileştirilmesi için çerezler
          kullanır. Çerezler, tarayıcınıza kaydedilen küçük metin dosyalarıdır. Aşağıda
          kullandığımız çerez türlerini bulabilirsiniz.
        </p>

        <h2 className="text-xl font-bold text-ink mt-8 mb-2">Çerez Türleri</h2>
        <div className="card p-0 mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink">
                <th className="p-3 font-semibold">Tür</th>
                <th className="p-3 font-semibold">Amaç</th>
                <th className="p-3 font-semibold">Onay</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-line">
                <td className="p-3 font-medium text-ink">Zorunlu</td>
                <td className="p-3">Oturum yönetimi, güvenlik ve temel platform işlevleri</td>
                <td className="p-3">Gerekli (onay aranmaz)</td>
              </tr>
              <tr className="border-b border-line">
                <td className="p-3 font-medium text-ink">Analitik</td>
                <td className="p-3">Ziyaret istatistikleri ve platform iyileştirme</td>
                <td className="p-3">İsteğe bağlı</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-ink">Tercih</td>
                <td className="p-3">İlçe, kategori ve görüntüleme tercihlerinizin hatırlanması</td>
                <td className="p-3">İsteğe bağlı</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-bold text-ink mt-8 mb-2">Oturum Çerezi: d38_session</h2>
        <p className="text-muted leading-relaxed mt-2">
          <code className="text-brand-700">d38_session</code> adlı zorunlu çerez, giriş
          yaptığınızda oturumunuzu güvenli biçimde sürdürmek için kullanılır.{" "}
          <code className="text-brand-700">httpOnly</code> olarak ayarlandığından tarayıcı
          tarafı betiklerle okunamaz ve yalnızca sunucuyla güvenli bağlantı üzerinden
          iletilir. Oturumunuz sona erdiğinde veya çıkış yaptığınızda silinir.
        </p>

        <h2 className="text-xl font-bold text-ink mt-8 mb-2">Çerezleri Yönetme</h2>
        <p className="text-muted leading-relaxed mt-2">
          Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz. Ancak
          zorunlu çerezleri engellerseniz oturum açma gibi temel işlevler çalışmayabilir.
          Daha fazla bilgi için{" "}
          <Link href="/gizlilik" className="text-brand-700 hover:underline">Gizlilik Politikası</Link>&apos;na bakın.
        </p>
      </div>
    </div>
  );
}
