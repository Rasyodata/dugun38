// Keşfet (rehber/blog) içerikleri — Kayseri odaklı SEO makaleleri.
// Hem liste (page.tsx) hem detay ([slug]/page.tsx) bu dosyayı import eder.

export type Block =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "li"; text: string };

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  /** Kapak görseli — /public/placeholders altındaki SVG */
  cover: string;
  /** İlgili kategori slug'ı (/kategori/<category>) */
  category: string;
  body: Block[];
}

export const ARTICLES: Article[] = [
  {
    slug: "kayseri-dugun-butcesi-2026",
    title: "Kayseri'de Düğün Bütçesi 2026: Gerçekçi Rehber",
    excerpt:
      "Kayseri'de ortalama bir düğün ne kadara mal oluyor? İlçe ilçe kişi başı salon fiyatları ve kalem kalem bütçe dağılımı.",
    cover: "/placeholders/dugun-salonu.svg",
    category: "dugun-salonu",
    body: [
      {
        type: "p",
        text: "Düğün planlamasının en çok kaygı yaratan kısmı bütçe. Kayseri'de 2026 sezonu için gerçekçi rakamları bir araya getirdik. Aşağıdaki fiyatlar piyasadaki ortalamaları yansıtır; kesin teklif için firmalardan tek formla teklif almanızı öneririz.",
      },
      { type: "h2", text: "İlçeye göre kişi başı salon fiyatları" },
      {
        type: "p",
        text: "Kayseri'de düğün salonu fiyatları ilçeye ve salonun donanımına göre değişiyor. 2026 sezonu için yemekli düğünlerde kişi başı ortalama rakamlar şöyle:",
      },
      { type: "li", text: "İncesu: kişi başı ~850₺ — yeni açılan lüks salonların yoğunlaştığı bölge." },
      { type: "li", text: "Kocasinan: kişi başı ~800₺ — merkezi konum, geniş kapasite seçenekleri." },
      { type: "li", text: "Melikgazi: kişi başı ~750₺ — en çok salon seçeneği burada." },
      { type: "li", text: "Talas: kişi başı ~700₺ — öğrenci ve genç çiftler için uygun fiyat." },
      { type: "h2", text: "Ortalama toplam düğün maliyeti" },
      {
        type: "p",
        text: "400 kişilik orta ölçekli bir düğün için Kayseri'de ortalama toplam maliyet 2026 itibarıyla yaklaşık 450.000₺ seviyesinde. Bu rakam salon, yemek, gelinlik, fotoğraf ve müzik gibi ana kalemleri kapsar.",
      },
      { type: "h2", text: "Kalem kalem bütçe dağılımı" },
      { type: "h3", text: "Salon ve yemek" },
      {
        type: "p",
        text: "Toplam bütçenin yaklaşık %55-60'ı salon ve catering'e gider. 400 kişilik bir düğünde salon + yemek kalemi 260.000₺ civarında bir yer tutar.",
      },
      { type: "h3", text: "Gelinlik, damatlık ve kuaför" },
      {
        type: "p",
        text: "Gelinlik (satış ya da kiralama), damatlık ve gelin saç-makyajı birlikte 60.000-80.000₺ aralığında planlanabilir. Kiralama tercih edildiğinde bu kalem belirgin şekilde düşer.",
      },
      { type: "h3", text: "Fotoğraf, video ve müzik" },
      {
        type: "p",
        text: "Profesyonel fotoğraf-video paketi 35.000-55.000₺, orkestra ya da DJ ise 25.000-45.000₺ arasında. Dış çekim (save the date) dahil edildiğinde fotoğraf kalemi biraz yükselir.",
      },
      { type: "h2", text: "Bütçeyi korumanın yolu" },
      {
        type: "p",
        text: "En sağlıklı yöntem, her kategoride en az üç firmadan teklif alıp karşılaştırmak. Duviora üzerinden tek formla birden fazla firmaya ulaşabilir, Güvenli Kaparo ile ödemelerinizi güvence altına alabilirsiniz.",
      },
    ],
  },
  {
    slug: "erciyes-kis-dugunu",
    title: "Erciyes'te Kış Düğünü: Masalsı Bir Gün",
    excerpt:
      "Kar manzaralı bir düğün hayal edenler için Erciyes bölgesinde kış düğünü rehberi: mekan, ısınma ve fotoğraf ipuçları.",
    cover: "/placeholders/kir-dugunu.svg",
    category: "kir-dugunu",
    body: [
      {
        type: "p",
        text: "Kayseri'nin simgesi Erciyes, kış aylarında masalsı bir düğün dekoru sunuyor. Beyaz örtüye bürünmüş dağ manzarası eşliğinde bir tören, giderek daha çok çiftin tercihi. Peki kış düğünü planlarken nelere dikkat etmeli?",
      },
      { type: "h2", text: "Kar manzarasını bir avantaja çevirin" },
      {
        type: "p",
        text: "Erciyes'in karlı zirvesi, hiçbir süslemenin yakalayamayacağı doğal bir arka plan. Tören saatini öğleden sonraya, gün ışığının yumuşadığı 'altın saat'e denk getirmek hem konukların üşümesini azaltır hem de fotoğraflarda sıcak tonlar yakalar.",
      },
      { type: "h2", text: "Kapalı mı, açık mı?" },
      {
        type: "p",
        text: "Kış düğününde karma plan en güvenlisi. Tören ve kokteyli ısıtmalı kapalı bir mekanda yapıp, kısa fotoğraf çekimleri için dışarıya çıkmak hem konforu hem manzarayı korur.",
      },
      { type: "li", text: "Erciyes etekindeki otellerin balo salonları kış düğünü için ideal." },
      { type: "li", text: "Açık alan düşünüyorsanız şeffaf/ısıtmalı tente (marquee) şart." },
      { type: "li", text: "Kar yağışı ihtimaline karşı B planı mekanı mutlaka belirleyin." },
      { type: "h2", text: "Isınma ve konuk konforu" },
      {
        type: "p",
        text: "Konuklarınız için dış kapıda kaşmir şal veya battaniye, sıcak içecek istasyonu (salep, sıcak şarap, Türk kahvesi) ve mantar ısıtıcılar büyük fark yaratır. Gelin için uzun kollu bir bolero ya da kürk pelerin hem şık hem pratik bir çözüm.",
      },
      { type: "h2", text: "Kış fotoğrafçılığı" },
      {
        type: "p",
        text: "Kar, ışığı yansıttığı için fotoğraflarda pozlama zorlaşabilir. Deneyimli bir düğün fotoğrafçısı seçmek burada kritik. Çekim süresini kısa tutun; gelin ve damadın üşümeden en güzel kareleri vereceği 15-20 dakikalık bloklar hâlinde planlayın.",
      },
      {
        type: "p",
        text: "Erciyes'te kış düğünü için mekan ve fotoğrafçı seçiminde Duviora'den teklif alarak başlayabilirsiniz.",
      },
    ],
  },
  {
    slug: "kayseri-kina-gecesi-gelenekleri",
    title: "Kayseri'de Kına Gecesi Gelenekleri",
    excerpt:
      "Yöresel kına adetleri, söylenen türküler ve kına gecesi için mekan seçimi — Kayseri'ye özgü bir gelenek rehberi.",
    cover: "/placeholders/kina-mekani.svg",
    category: "kina-mekani",
    body: [
      {
        type: "p",
        text: "Kına gecesi, Anadolu'nun en duygusal düğün geleneklerinden biri. Kayseri'de bu gelenek hem köklü adetleri hem de modern kutlama biçimlerini bir arada yaşatıyor.",
      },
      { type: "h2", text: "Yöresel adetler" },
      {
        type: "p",
        text: "Kayseri'de kına genellikle düğünden bir gece önce, gelinin ailesinin ya da yakınlarının evinde ya da tutulan bir kına mekanında yapılır. Gelin, bindallı denilen işlemeli kadife kıyafetiyle salona alınır; başına kırmızı bir örtü örtülür.",
      },
      { type: "li", text: "Kınayı genellikle çocuğu ve eşi hayatta, mutlu bir evliliğe sahip bir kadın yakar." },
      { type: "li", text: "Gelinin avucuna altın konur; kına avuç kapatılarak yakılır." },
      { type: "li", text: "Çevredeki genç kızlar da uğur getirmesi için parmaklarına kına yakar." },
      { type: "h2", text: "Kına türküleri ve ağlaşma" },
      {
        type: "p",
        text: "Kına yakılırken söylenen ağıt niteliğindeki türküler, gelinin baba evinden ayrılışını anlatır. 'Yüksek yüksek tepelere ev kurmasınlar' gibi türküler eşliğinde gelinin ve annesinin gözyaşı dökmesi âdettendir; bu, geleneğin en dokunaklı anıdır. Ardından davul-zurna ya da def eşliğinde eğlence başlar.",
      },
      { type: "h2", text: "Mekan seçimi" },
      {
        type: "p",
        text: "Eskiden evlerde yapılan kına geceleri, bugün Kayseri'de çoğunlukla kına salonlarında düzenleniyor. Mekan seçerken dikkat edilecekler:",
      },
      { type: "li", text: "Bindallı giyimli gelinin görkemli girişi için uygun bir sahne/merdiven." },
      { type: "li", text: "Canlı müzik ve oyun havaları için yeterli pist alanı." },
      { type: "li", text: "Yöresel ikramlar (şerbet, lokum, kuru pasta) için catering desteği." },
      { type: "h2", text: "Modern dokunuşlar" },
      {
        type: "p",
        text: "Günümüzde çiftler geleneği korurken kına tepsisi süslemeleri, el yapımı mumlar ve tematik dekorlarla kişisel dokunuşlar ekliyor. Kayseri'deki kına mekanlarını karşılaştırmak için Duviora'den teklif alabilirsiniz.",
      },
    ],
  },
  {
    slug: "nikah-dairesi-kayseri-rehberi",
    title: "Kayseri'de Nikah İşlemleri ve Randevu",
    excerpt:
      "Belediye nikah daireleri, gerekli evraklar ve randevu süreci hakkında genel bir rehber. İşlemleri yapmadan önce resmi kaynaktan teyit edin.",
    cover: "/placeholders/nisan-mekani.svg",
    category: "nisan-mekani",
    body: [
      {
        type: "p",
        text: "Resmi nikah, düğün hazırlığının bürokratik ama en önemli adımı. Kayseri'de nikah işlemlerinin nasıl ilerlediğini genel hatlarıyla özetledik. Not: Mevzuat ve ücretler değişebilir; işlemlere başlamadan önce başvuracağınız belediyenin evlendirme müdürlüğünden ya da resmi web sitesinden güncel bilgiyi mutlaka teyit edin.",
      },
      { type: "h2", text: "Nereye başvurulur?" },
      {
        type: "p",
        text: "Kayseri'de nikah başvuruları ilçe belediyelerinin evlendirme memurluklarına yapılır (Melikgazi, Kocasinan, Talas ve diğer ilçeler). Çiftlerden en az birinin o ilçede ikamet ediyor olması genellikle yeterlidir; ancak bazı belediyeler farklı uygulama yapabilir.",
      },
      { type: "h2", text: "Gerekli evraklar (genel)" },
      { type: "li", text: "Nüfus cüzdanı / T.C. kimlik kartı (her iki taraf için)." },
      { type: "li", text: "Vesikalık fotoğraf (genellikle kişi başı 4-6 adet)." },
      { type: "li", text: "Evlenecek kişilerin sağlık raporu (aile hekimi ya da belediyenin yönlendirdiği kurum)." },
      { type: "li", text: "Varsa önceki evliliğe dair boşanma/ölüm belgesi." },
      {
        type: "p",
        text: "Evrak listesi belediyeden belediyeye küçük farklılıklar gösterebilir; bu yüzden başvurudan önce liste için ilgili müdürlüğü aramak zaman kazandırır.",
      },
      { type: "h2", text: "Randevu süreci" },
      {
        type: "p",
        text: "Çoğu Kayseri belediyesi nikah randevusunu online randevu sistemi ya da e-Devlet üzerinden veriyor. Başvuru onaylandıktan sonra evlendirme dairesinde ya da talep edilirse salon/dış mekanda tören günü belirlenir. Yoğun sezonda (yaz ayları) uygun tarihlerin erken dolduğunu unutmayın.",
      },
      { type: "h3", text: "Dış mekanda nikah" },
      {
        type: "p",
        text: "Bahçe, otel ya da salon gibi dış mekanlarda nikah kıydırmak isteyenler için belediyeler ek izin ve memur görevlendirmesi yapar. Bu durumda ayrıca bir ücret alınabilir.",
      },
      { type: "h2", text: "Önemli hatırlatma" },
      {
        type: "p",
        text: "Buradaki bilgiler genel bir yol haritasıdır, resmi işlem rehberi değildir. Güncel evrak, ücret ve randevu detayları için Kayseri'deki ilgili belediyenin evlendirme müdürlüğüne veya resmi web sitesine başvurun.",
      },
    ],
  },
  {
    slug: "yoresel-dugun-menusu-manti-yaglama",
    title: "Yöresel Düğün Menüsü: Mantı, Yağlama ve Fazlası",
    excerpt:
      "Kayseri mutfağını düğün sofrasına taşıyın. Mantıdan yağlamaya yöresel menü önerileri ve kişi başı maliyet.",
    cover: "/placeholders/catering.svg",
    category: "catering",
    body: [
      {
        type: "p",
        text: "Kayseri denince akla ilk gelen mutfak kültürü, düğün sofralarının da yıldızı. Konuklarınıza unutulmaz bir deneyim yaşatmak isterseniz yöresel bir düğün menüsü mükemmel bir seçim.",
      },
      { type: "h2", text: "Başlangıçlar" },
      {
        type: "p",
        text: "Sofraya yöresel bir giriş için pastırmalı ve sucuklu küçük tabaklar, çömlek peyniri ve zeytinle açılış yapabilirsiniz. Mevsimine göre mercimek çorbası ya da yöresel tutmaç çorbası da sıcak bir karşılama sunar.",
      },
      { type: "h2", text: "Ana yemekler" },
      { type: "h3", text: "Kayseri mantısı" },
      {
        type: "p",
        text: "Düğün menüsünün değişmezi: minik Kayseri mantısı, bol yoğurt, nane ve kızgın tereyağıyla servis edilir. Canlı mantı istasyonu kurmak konuklar için hem lezzetli hem gösterişli bir deneyim yaratır.",
      },
      { type: "h3", text: "Yağlama ve etli yemekler" },
      {
        type: "p",
        text: "İnce açılmış yufka üzerine kıyma ve yoğurtla hazırlanan yağlama, Kayseri düğünlerinin bir diğer klasiği. Yanında fırın kebabı ya da pastırmalı kuru fasulye gibi doyurucu et yemekleri menüyü tamamlar.",
      },
      { type: "h2", text: "Tatlı ve ikramlar" },
      {
        type: "p",
        text: "Nevzine tatlısı, un helvası ve şerbetli yöresel tatlılar sofranın finali olabilir. Yanında Türk kahvesi ve bol kaymaklı ikramlar sıcak bir kapanış sağlar.",
      },
      { type: "h2", text: "Kişi başı maliyet" },
      {
        type: "p",
        text: "Yöresel düğün menüsü, içeriğe göre Kayseri'de kişi başı yaklaşık 450-700₺ aralığında planlanabilir. Mantı istasyonu, canlı pişirme ve pastırma gibi özel kalemler eklendikçe rakam üst banda yaklaşır.",
      },
      { type: "li", text: "Standart yöresel menü: kişi başı ~450-550₺." },
      { type: "li", text: "Canlı istasyonlu zengin menü: kişi başı ~600-700₺." },
      {
        type: "p",
        text: "Catering firmalarından karşılaştırmalı teklif almak için Duviora'i kullanabilir, menüyü konuk sayınıza göre birlikte planlayabilirsiniz.",
      },
    ],
  },
  {
    slug: "gelinlik-secimi-rehberi",
    title: "Vücut Tipine Göre Gelinlik Seçimi",
    excerpt:
      "A kesim, balık ve prenses modelleri hangi vücut tipine yakışır? Prova sürecinde işinizi kolaylaştıracak ipuçları.",
    cover: "/placeholders/gelinlik.svg",
    category: "gelinlik",
    body: [
      {
        type: "p",
        text: "Gelinlik seçimi, pek çok gelin için düğün hazırlığının en heyecanlı ama en zorlayıcı kısmı. Doğru model, vücut hatlarınızı en doğal hâliyle öne çıkaran modeldir. İşte temel kesimler ve kime yakıştıkları.",
      },
      { type: "h2", text: "A kesim (prenses değil, zarif üçgen)" },
      {
        type: "p",
        text: "Belden itibaren hafifçe genişleyen A kesim, neredeyse her vücut tipine yakışan en güvenli seçim. Özellikle armut tipi (kalçası omzundan geniş) vücutlara dengeli bir siluet kazandırır. Boyu kısa gelinler için de uzatıcı etkisiyle idealdir.",
      },
      { type: "h2", text: "Balık (mermaid) kesim" },
      {
        type: "p",
        text: "Bele kadar oturan, diz altından açılan balık kesim; kum saati ve dengeli hatlara sahip gelinlerde muhteşem durur. Vücut hatlarını belirgin gösterdiği için prova sırasında rahat hareket edip edemediğinizi mutlaka test edin.",
      },
      { type: "h2", text: "Prenses (ball gown) kesim" },
      {
        type: "p",
        text: "Belden sonra hacimli etekle açılan prenses model, masalsı bir görünüm sunar ve alt bölgeyi gizlemek isteyen gelinler için idealdir. Boyu çok kısa gelinlerde fazla hacim boğucu durabilir; bu durumda etek hacmini dengelemek gerekir.",
      },
      { type: "h2", text: "Diğer modeller" },
      { type: "li", text: "Empire (göğüs altından dökümlü): hamile gelinler ve ince siluet isteyenler için." },
      { type: "li", text: "Trompet: balık ile A kesim arası; balığın zarafetini daha rahat haliyle sunar." },
      { type: "li", text: "Kılıf (sheath): sade, modern ve nikah törenleri için şık bir alternatif." },
      { type: "h2", text: "Prova ipuçları" },
      {
        type: "p",
        text: "Prova sürecini stresten çıkarmak için birkaç pratik öneri:",
      },
      { type: "li", text: "Provaya düğünde giyeceğiniz renkte iç çamaşırı ve uygun bir ayakkabı topuğuyla gidin." },
      { type: "li", text: "İlk provayı düğünden en az 2-3 ay önce yapın; tadilat için zaman bırakın." },
      { type: "li", text: "Yanınıza en fazla 1-2 kişi alın; çok kalabalık fikir kararınızı zorlaştırır." },
      {
        type: "p",
        text: "Kayseri'deki gelinlik mağazalarını karşılaştırmak ve prova randevusu için Duviora üzerinden teklif alabilirsiniz.",
      },
    ],
  },
];

export const ARTICLE_BY_SLUG: Record<string, Article> = Object.fromEntries(
  ARTICLES.map((a) => [a.slug, a]),
);
