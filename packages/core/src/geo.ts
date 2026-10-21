// Kayseri'nin 16 ilçesi. Rapor: "Sadece Kayseri, 16 ilçenin hepsi".
// Ortalama kişi başı / kapasite / fiyat verileri iş geliştirme raporundan (merkez ilçeler)
// ve çevre ilçeler için makul tahminlerden gelir (seed/SEO metni için).

export interface District {
  slug: string;
  name: string;
  /** Merkez ilçe mi? (veri yoğunluğu yüksek) */
  central: boolean;
  /** Ortalama kişi başı menü (TL) — SEO ve filtre referansı */
  avgPerGuest: number;
  /** Ortalama salon kapasitesi */
  avgCapacity: number;
}

export const DISTRICTS: District[] = [
  { slug: "kocasinan", name: "Kocasinan", central: true, avgPerGuest: 800, avgCapacity: 600 },
  { slug: "melikgazi", name: "Melikgazi", central: true, avgPerGuest: 750, avgCapacity: 550 },
  { slug: "talas", name: "Talas", central: true, avgPerGuest: 700, avgCapacity: 600 },
  { slug: "incesu", name: "İncesu", central: true, avgPerGuest: 850, avgCapacity: 900 },
  { slug: "develi", name: "Develi", central: false, avgPerGuest: 600, avgCapacity: 500 },
  { slug: "bunyan", name: "Bünyan", central: false, avgPerGuest: 600, avgCapacity: 450 },
  { slug: "yahyali", name: "Yahyalı", central: false, avgPerGuest: 580, avgCapacity: 450 },
  { slug: "hacilar", name: "Hacılar", central: false, avgPerGuest: 650, avgCapacity: 400 },
  { slug: "pinarbasi", name: "Pınarbaşı", central: false, avgPerGuest: 550, avgCapacity: 400 },
  { slug: "tomarza", name: "Tomarza", central: false, avgPerGuest: 550, avgCapacity: 350 },
  { slug: "yesilhisar", name: "Yeşilhisar", central: false, avgPerGuest: 550, avgCapacity: 350 },
  { slug: "sarioglan", name: "Sarıoğlan", central: false, avgPerGuest: 500, avgCapacity: 300 },
  { slug: "sariz", name: "Sarız", central: false, avgPerGuest: 500, avgCapacity: 300 },
  { slug: "akkisla", name: "Akkışla", central: false, avgPerGuest: 500, avgCapacity: 300 },
  { slug: "felahiye", name: "Felahiye", central: false, avgPerGuest: 500, avgCapacity: 300 },
  { slug: "ozvatan", name: "Özvatan", central: false, avgPerGuest: 500, avgCapacity: 300 },
];

export const DISTRICT_BY_SLUG: Record<string, District> = Object.fromEntries(
  DISTRICTS.map((d) => [d.slug, d]),
);

export const CITY = { slug: "kayseri", name: "Kayseri", plate: 38 } as const;
