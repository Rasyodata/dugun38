// 20 kategori × 16 ilçe = 320 SEO sayfası (rakip analizi raporundan).
// VENUE = mekan (kapasite + kişi başı fiyat mantığı), SERVICE = hizmet (paket fiyat mantığı).

export type CategoryKind = "VENUE" | "SERVICE";

export interface Category {
  slug: string;
  name: string;
  /** Çoğul/liste başlığı, SEO için: "Kayseri Düğün Salonları" */
  plural: string;
  kind: CategoryKind;
  icon: string; // emoji — mobil + web ortak, bağımlılık yok
  /** Kısa SEO açıklaması şablonu parçası */
  blurb: string;
}

export const CATEGORIES: Category[] = [
  // --- Mekanlar ---
  { slug: "dugun-salonu", name: "Düğün Salonu", plural: "Düğün Salonları", kind: "VENUE", icon: "🏛️", blurb: "kapalı salon düğünü" },
  { slug: "kir-dugunu", name: "Kır Düğünü & Bahçe", plural: "Kır Düğünü & Bahçe Mekanları", kind: "VENUE", icon: "🌳", blurb: "açık havada bahçe düğünü" },
  { slug: "kina-mekani", name: "Kına Mekanı", plural: "Kına Mekanları", kind: "VENUE", icon: "🕯️", blurb: "kına gecesi mekanı" },
  { slug: "otel-dugunu", name: "Otel Düğünü", plural: "Otel Düğünü Mekanları", kind: "VENUE", icon: "🏨", blurb: "otelde düğün ve balo" },
  { slug: "nisan-mekani", name: "Nişan Mekanı", plural: "Nişan Mekanları", kind: "VENUE", icon: "💍", blurb: "nişan ve söz organizasyonu" },
  { slug: "tarihi-mekan", name: "Tarihi Mekan", plural: "Tarihi Mekanlar", kind: "VENUE", icon: "🏰", blurb: "tarihi kervansaray ve konak düğünü" },
  { slug: "havuz-basi", name: "Havuz Başı Düğün", plural: "Havuz Başı Düğün Mekanları", kind: "VENUE", icon: "🏊", blurb: "havuz başında açık hava düğünü" },
  { slug: "sosyal-tesis", name: "Sosyal Tesis", plural: "Sosyal Tesisler", kind: "VENUE", icon: "🏢", blurb: "belediye ve kurum sosyal tesisi" },
  { slug: "nikah-salonu", name: "Nikah Salonu", plural: "Nikah Salonları", kind: "VENUE", icon: "💒", blurb: "resmi nikah ve küçük tören salonu" },
  // --- Hizmetler ---
  { slug: "gelinlik", name: "Gelinlik", plural: "Gelinlik Mağazaları", kind: "SERVICE", icon: "👰", blurb: "gelinlik satış ve kiralama" },
  { slug: "damatlik", name: "Damatlık & Smokin", plural: "Damatlık & Smokin", kind: "SERVICE", icon: "🤵", blurb: "damatlık ve smokin" },
  { slug: "fotograf-video", name: "Fotoğraf & Video", plural: "Düğün Fotoğrafçıları", kind: "SERVICE", icon: "📷", blurb: "düğün fotoğraf ve video çekimi" },
  { slug: "organizasyon", name: "Düğün Organizasyonu", plural: "Düğün Organizasyon Firmaları", kind: "SERVICE", icon: "🎪", blurb: "anahtar teslim düğün organizasyonu" },
  { slug: "muzik-orkestra", name: "Müzik & Orkestra / DJ", plural: "Müzik, Orkestra ve DJ", kind: "SERVICE", icon: "🎶", blurb: "canlı müzik, orkestra ve DJ" },
  { slug: "davetiye", name: "Davetiye", plural: "Davetiye Firmaları", kind: "SERVICE", icon: "✉️", blurb: "düğün davetiyesi" },
  { slug: "gelin-arabasi", name: "Gelin Arabası", plural: "Gelin Arabası Kiralama", kind: "SERVICE", icon: "🚗", blurb: "gelin arabası süsleme ve kiralama" },
  { slug: "kuafor-makyaj", name: "Kuaför & Makyaj", plural: "Gelin Kuaförü & Makyaj", kind: "SERVICE", icon: "💄", blurb: "gelin saçı ve makyajı" },
  { slug: "catering", name: "Catering & Yemek", plural: "Düğün Catering Firmaları", kind: "SERVICE", icon: "🍽️", blurb: "düğün yemeği ve catering" },
  { slug: "pasta-tatli", name: "Pasta & Şekerleme", plural: "Düğün Pastası & Şekerleme", kind: "SERVICE", icon: "🎂", blurb: "düğün pastası ve tatlı" },
  { slug: "nikah-sekeri", name: "Nikah Şekeri", plural: "Nikah Şekeri", kind: "SERVICE", icon: "🍬", blurb: "nikah şekeri ve hediyelik" },
  { slug: "taki-pirlanta", name: "Takı & Pırlanta", plural: "Takı & Pırlanta", kind: "SERVICE", icon: "💎", blurb: "söz, nişan ve düğün takıları" },
  { slug: "alyans", name: "Alyans & Kuyumcu", plural: "Alyans & Kuyumcu", kind: "SERVICE", icon: "💛", blurb: "alyans ve yüzük" },
  { slug: "susleme-cicek", name: "Süsleme & Çiçek", plural: "Düğün Süsleme & Çiçek", kind: "SERVICE", icon: "💐", blurb: "düğün çiçeği ve masa süslemesi" },
  { slug: "balayi", name: "Balayı & Seyahat", plural: "Balayı & Seyahat", kind: "SERVICE", icon: "✈️", blurb: "balayı tatili ve seyahat" },
];

export const CATEGORY_BY_SLUG: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
);

export const VENUE_CATEGORIES = CATEGORIES.filter((c) => c.kind === "VENUE");
export const SERVICE_CATEGORIES = CATEGORIES.filter((c) => c.kind === "SERVICE");
