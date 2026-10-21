import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/password.js";
import {
  DISTRICTS,
  CATEGORY_BY_SLUG,
  calcDeposit,
  calcCommission,
} from "@dugun38/core";

const prisma = new PrismaClient();

function slugify(s: string): string {
  const map: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i", ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return s
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (c) => map[c] ?? c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Seed deterministik olsun diye küçük PRNG (çalıştırmalar arası tutarlılık).
let _s = 38;
function rnd() {
  _s = (_s * 1103515245 + 12345) & 0x7fffffff;
  return _s / 0x7fffffff;
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rnd() * arr.length)]!;
}

interface FirmSeed {
  business: string;
  category: string;
  districts: string[]; // hizmet bölgeleri
  capacity?: number;
  pricePerGuest?: number;
  minPrice?: number;
  maxPrice?: number;
  about: string;
  showcase?: boolean;
  rating: number;
  ratingCount: number;
}

// Gerçek Kayseri düğün/davet mekanları (kaynak: dugun.com Kayseri listeleri).
// Kapasite/fiyat kısmen dugun.com verisi, kısmen ilçe ortalamalarından tahmin.
const FIRMS: FirmSeed[] = [
  // --- Mekanlar (gerçek) ---
  { business: "Erciyes Binicilik Balo & Davet Salonu", category: "kir-dugunu", districts: ["melikgazi"], capacity: 800, pricePerGuest: 950, about: "Hisarcık'ta binicilik tesisi içinde, Erciyes manzaralı geniş kır bahçesi ve balo salonu. Doğal çim alan ve açık hava nikahı.", showcase: true, rating: 4.9, ratingCount: 163 },
  { business: "İdeal Moonlight", category: "kir-dugunu", districts: ["melikgazi"], capacity: 1500, pricePerGuest: 950, about: "Büyük kapasiteli, modern aydınlatmalı davet mekanı. Hem kır hem salon konseptinde kalabalık düğünler.", showcase: true, rating: 4.3, ratingCount: 337 },
  { business: "Diva Premium", category: "dugun-salonu", districts: ["talas"], capacity: 600, pricePerGuest: 1000, about: "Premium dekorlu, çok yüksek puanlı kapalı düğün salonu. Kaliteli servis ve şık atmosfer.", showcase: true, rating: 4.9, ratingCount: 119 },
  { business: "Hayal Evim Event Garden", category: "kir-dugunu", districts: ["melikgazi"], capacity: 250, pricePerGuest: 500, about: "Yeşillikler içinde butik ölçekli şık bir kır düğünü bahçesi. Samimi, küçük/orta ölçekli davetler.", showcase: true, rating: 4.9, ratingCount: 22 },
  { business: "My Berra Düğün ve Etkinlik Merkezi", category: "kir-dugunu", districts: ["melikgazi", "kocasinan"], capacity: 1200, pricePerGuest: 800, about: "Hisarcık'ta geniş kır bahçesi ve etkinlik alanı. Açık hava düğün ve davetler için büyük kapasite.", rating: 4.8, ratingCount: 48 },
  { business: "Milena Düğün Salonu", category: "dugun-salonu", districts: ["kocasinan"], capacity: 600, pricePerGuest: 800, about: "Kocasinan'da modern dekorlu, yüksek puanlı kapalı düğün salonu. Orta-büyük ölçekli düğünler.", rating: 4.9, ratingCount: 34 },
  { business: "Tulpar Binicilik", category: "kir-dugunu", districts: ["kocasinan", "incesu"], capacity: 1800, pricePerGuest: 600, about: "Binicilik tesisi içinde doğayla iç içe geniş kır düğünü alanı. Atlı konsept, çok büyük açık bahçe.", rating: 4.9, ratingCount: 24 },
  { business: "Friesian", category: "kir-dugunu", districts: ["talas"], capacity: 1000, pricePerGuest: 700, about: "Talas'ta doğal güzellikler içinde geniş kır düğünü alanı. Binicilik temalı, ferah açık bahçe.", rating: 4.9, ratingCount: 32 },
  { business: "Wyndham Grand Kayseri", category: "otel-dugunu", districts: ["kocasinan"], capacity: 850, pricePerGuest: 980, about: "Gün ışığı alan yüksek tavanlı balo salonuyla beş yıldızlı otel düğünü. Yemekli ve kokteyl hizmeti.", showcase: true, rating: 4.5, ratingCount: 24 },
  { business: "Hilton Kayseri", category: "otel-dugunu", districts: ["melikgazi"], capacity: 600, pricePerGuest: 850, about: "Erciyes ve Kayseri Kalesi manzaralı teras ve balo salonu. Şehir merkezinde profesyonel servis.", rating: 4.5, ratingCount: 18 },
  { business: "Kervansaray Kır Mekanı", category: "tarihi-mekan", districts: ["incesu"], capacity: 1200, pricePerGuest: 1140, about: "Tarihi kervansaray avlusunda çim üzeri masalar ve dans alanıyla eşsiz kır düğünü. Açık hava nikahı.", rating: 4.6, ratingCount: 19 },
  { business: "Flamingo Garden Davet", category: "havuz-basi", districts: ["melikgazi", "kocasinan"], capacity: 900, pricePerGuest: 780, about: "Flamingo temalı peyzajı, havuz başı ve geniş kır bahçesiyle öne çıkan davet mekanı.", showcase: true, rating: 4.7, ratingCount: 41 },
  { business: "Sadabad Gold", category: "dugun-salonu", districts: ["kocasinan"], capacity: 1000, pricePerGuest: 750, about: "Geniş kapasiteli, ışıl ışıl dekorlu balo salonu. Kalabalık düğün ve davetler için ferah kapalı mekan.", rating: 4.9, ratingCount: 18 },
  { business: "Dubai Palace & Terrace", category: "havuz-basi", districts: ["kocasinan"], capacity: 1000, pricePerGuest: 690, about: "Teras ve açık bahçe konseptiyle geniş davet mekanı. Kır düğünü ve kokteyl organizasyonları.", rating: 4.9, ratingCount: 16 },
  { business: "Armonia Deluxe", category: "dugun-salonu", districts: ["talas"], capacity: 1200, pricePerGuest: 700, about: "Geniş kapasiteli deluxe balo salonu. Büyük düğün ve davetlere uygun ferah iç mekan.", rating: 4.6, ratingCount: 14 },
  { business: "Dorse Düğün Salonu", category: "dugun-salonu", districts: ["melikgazi"], capacity: 875, pricePerGuest: 750, about: "Ferah kapalı balo salonu. Modern iç tasarımı ve servis kalitesiyle şehir içi düğün mekanı.", rating: 4.8, ratingCount: 29 },
  { business: "Alice Palazzo Balo Salonu", category: "dugun-salonu", districts: ["kocasinan"], capacity: 625, pricePerGuest: 780, about: "Saray konseptli dekoruyla dikkat çeken kapalı düğün ve etkinlik salonu. Orta-büyük ölçekli davetler.", rating: 4.6, ratingCount: 14 },
  { business: "Florya Deluxe Düğün Salonu", category: "dugun-salonu", districts: ["kocasinan"], capacity: 700, pricePerGuest: 800, about: "Deluxe iç tasarımlı kapalı balo salonu. Yüksek memnuniyet ve orta-büyük kapasite.", rating: 4.7, ratingCount: 14 },
  { business: "Mahall Balo ve Kongre Merkezi", category: "dugun-salonu", districts: ["melikgazi"], capacity: 2000, pricePerGuest: 800, about: "Çok büyük kapasiteli balo ve kongre merkezi. Yüksek tavanlı salonlarıyla büyük düğün ve kurumsal davetler.", rating: 4.5, ratingCount: 24 },
  { business: "Ottoman Paradise Kır Düğün Salonu", category: "kir-dugunu", districts: ["melikgazi"], capacity: 1000, pricePerGuest: 600, about: "Osmanlı temalı dekoruyla geniş kır düğünü alanı. Kalabalık davetlere uygun açık bahçe ve nikah alanı.", rating: 4.5, ratingCount: 12 },
  { business: "Taş Bahçe Ziyafet Balo Salonu", category: "dugun-salonu", districts: ["melikgazi"], capacity: 700, pricePerGuest: 650, about: "Taş dokulu dekoru ve bahçe alanıyla hem kapalı balo hem açık ziyafet imkanı. Orta-büyük düğünler.", rating: 4.6, ratingCount: 12 },
  { business: "Merve Deluxe Düğün & Kına Salonu", category: "kina-mekani", districts: ["melikgazi"], capacity: 400, pricePerGuest: 650, about: "Kına gecesi organizasyonları için deluxe dekorlu salon. Orta ölçekli kına ve nişan davetleri.", rating: 4.2, ratingCount: 13 },
  { business: "Kayseri Sofrası Care Restaurant", category: "kir-dugunu", districts: ["incesu"], capacity: 1000, pricePerGuest: 850, about: "Restoran ve kır düğünü konseptini birleştiren, yeşillikler içinde geniş bahçe. Büyük gruplara uygun.", rating: 4.5, ratingCount: 15 },
  { business: "Develi Çamlıca Kır Bahçesi", category: "kir-dugunu", districts: ["develi"], capacity: 1200, pricePerGuest: 550, about: "Develi'de çam ağaçları arasında geniş kır düğünü bahçesi. Doğayla iç içe açık hava davetler.", rating: 4.5, ratingCount: 14 },
  { business: "Foto Yılmaz Sosyal Tesisleri", category: "sosyal-tesis", districts: ["develi"], capacity: 875, pricePerGuest: 550, about: "Develi ilçe merkezinde geniş kapasiteli sosyal tesis ve düğün salonu. Yerel düğünler için pratik.", rating: 4.4, ratingCount: 16 },
  { business: "AHM Sosyal Tesisleri", category: "sosyal-tesis", districts: ["yahyali"], capacity: 1200, pricePerGuest: 550, about: "Yahyalı'da büyük kapasiteli düğün salonu ve sosyal tesis. İlçenin en geniş kapalı davet alanlarından.", rating: 4.4, ratingCount: 20 },
  { business: "Karatay Han Butik Otel & Restaurant", category: "tarihi-mekan", districts: ["pinarbasi"], capacity: 150, pricePerGuest: 500, about: "Pınarbaşı'nda tarihi kervansaray dokulu butik otel. Küçük/butik ölçekli otel düğünü ve davetler.", rating: 4.5, ratingCount: 12 },
  { business: "Hacılar Belediyesi Düğün Salonu", category: "nikah-salonu", districts: ["hacilar"], capacity: 250, pricePerGuest: 500, about: "Hacılar'da orta ölçekli kapalı düğün salonu. Uygun fiyatlı, pratik yerel düğün ve davet mekanı.", rating: 4.3, ratingCount: 11 },
  { business: "Tomarza Belediyesi Düğün Salonu", category: "nikah-salonu", districts: ["tomarza"], capacity: 450, pricePerGuest: 500, about: "Tomarza ilçe merkezinde belediyeye ait düğün salonu. Orta ölçekli yerel düğünler için ekonomik.", rating: 4.2, ratingCount: 13 },
  // --- Hizmetler ---
  { business: "Kayseri Kare Fotoğraf & Video", category: "fotograf-video", districts: DISTRICTS.map((d) => d.slug), minPrice: 12000, maxPrice: 45000, about: "Dış çekim, düğün günü klip ve albüm. Tüm Kayseri'ye hizmet.", showcase: true, rating: 4.8, ratingCount: 88 },
  { business: "Zarif Gelinlik Evi", category: "gelinlik", districts: ["kocasinan", "melikgazi", "talas"], minPrice: 8000, maxPrice: 60000, about: "Satış ve kiralık gelinlik, prova ve tadilat dahil.", rating: 4.5, ratingCount: 64 },
  { business: "Lezzet Durağı Catering", category: "catering", districts: ["talas", "melikgazi", "kocasinan", "incesu"], minPrice: 250, maxPrice: 1200, about: "Yöresel mantı ve yağlama dahil düğün catering menüleri (kişi başı).", rating: 4.6, ratingCount: 52 },
  { business: "Melodi Orkestra & DJ", category: "muzik-orkestra", districts: DISTRICTS.filter((d) => d.central).map((d) => d.slug), minPrice: 9000, maxPrice: 35000, about: "Canlı orkestra, DJ ve ses-ışık sistemi.", rating: 4.4, ratingCount: 37 },
  { business: "Gül & Dal Süsleme", category: "susleme-cicek", districts: ["melikgazi", "kocasinan", "talas", "hacilar"], minPrice: 4000, maxPrice: 25000, about: "Gelin buketi, masa ve araç süsleme.", rating: 4.7, ratingCount: 29 },
];

async function main() {
  console.log("🌱 Seed başlıyor…");

  // Temizle (geliştirme kolaylığı; reset script force-reset ile çağrılır)
  await prisma.auditLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.message.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.offerRequest.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.blockedDate.deleteMany();
  await prisma.package.deleteMany();
  await prisma.media.deleteMany();
  await prisma.firmDistrict.deleteMany();
  await prisma.firmProfile.deleteMany();
  await prisma.agendaItem.deleteMany();
  await prisma.budgetItem.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Admin
  await prisma.user.create({
    data: {
      role: "ADMIN",
      name: "Düğün38 Yönetici",
      email: "admin@dugun38.local",
      phone: "5000000000",
      passwordHash: await hashPassword("admin1234"),
      kvkkAcceptedAt: new Date(),
      emailVerified: true,
    },
  });

  // Demo çift
  const couple = await prisma.user.create({
    data: {
      role: "COUPLE",
      name: "Ayşe & Mehmet",
      email: "cift@dugun38.local",
      phone: "5321112233",
      passwordHash: await hashPassword("cift1234"),
      kvkkAcceptedAt: new Date(),
      emailVerified: true,
      partnerName: "Mehmet",
      weddingDate: new Date(Date.now() + 150 * 24 * 3600 * 1000),
    },
  });

  // Firmalar
  const firmRecords: { id: string; seed: FirmSeed }[] = [];
  let i = 0;
  for (const f of FIRMS) {
    i++;
    const user = await prisma.user.create({
      data: {
        role: "FIRM",
        name: f.business,
        email: `firma${i}@dugun38.local`,
        phone: `55${String(10000000 + i).slice(0, 8)}`,
        passwordHash: await hashPassword("firma1234"),
        kvkkAcceptedAt: new Date(),
        emailVerified: true,
      },
    });
    const firm = await prisma.firmProfile.create({
      data: {
        userId: user.id,
        businessName: f.business,
        slug: slugify(f.business),
        categorySlug: f.category,
        about: f.about,
        capacity: f.capacity ?? null,
        pricePerGuest: f.pricePerGuest ?? null,
        minPrice: f.minPrice ?? (f.pricePerGuest ? f.pricePerGuest * (f.capacity ?? 300) : null),
        maxPrice: f.maxPrice ?? (f.pricePerGuest ? f.pricePerGuest * (f.capacity ?? 600) : null),
        publicPhone: `53${String(20000000 + i).slice(0, 8)}`,
        verified: true,
        showcase: f.showcase ?? false,
        ratingAvg: f.rating,
        ratingCount: f.ratingCount,
        responseMedianMin: 60 + Math.floor(rnd() * 300),
        hasVideo: (f.showcase ?? false) || i % 2 === 0,
        hasTour360: CATEGORY_BY_SLUG[f.category]?.kind === "VENUE" && ((f.showcase ?? false) || f.ratingCount >= 25),
        districts: { create: f.districts.map((d) => ({ districtSlug: d })) },
        media: {
          create: [
            // Kapak: gerçek mekan fotoğrafı (public/venues/<slug>.webp)
            { url: `/venues/${slugify(f.business)}.webp`, alt: `${f.business}`, sort: 0 },
            // Galeri yedekleri (dekoratif)
            { url: `/placeholders/${f.category}.svg`, alt: `${f.business} görsel 2`, sort: 1 },
            { url: `/placeholders/${f.category}.svg`, alt: `${f.business} görsel 3`, sort: 2 },
          ],
        },
        packages: {
          create: f.pricePerGuest
            ? [
                { name: "Ekonomik Menü", price: f.pricePerGuest, description: "Çorba, ana yemek, tatlı, meşrubat (kişi başı)", sort: 0 },
                { name: "Standart Menü", price: Math.round(f.pricePerGuest * 1.25), description: "Zengin açık büfe + ikramlar (kişi başı)", sort: 1 },
                { name: "Lüks Menü", price: Math.round(f.pricePerGuest * 1.6), description: "Et menüsü, canlı istasyonlar, pasta dahil (kişi başı)", sort: 2 },
              ]
            : [
                { name: "Başlangıç Paketi", price: f.minPrice ?? 10000, description: "Temel hizmet paketi", sort: 0 },
                { name: "Premium Paket", price: Math.round(((f.minPrice ?? 10000) + (f.maxPrice ?? 30000)) / 2), description: "Gelişmiş hizmet paketi", sort: 1 },
              ],
        },
      },
    });
    firmRecords.push({ id: firm.id, seed: f });
  }

  // Örnek teklif akışı + tamamlanmış rezervasyon + yorum (kurallı yorumu kanıtlar)
  const venueFirm = firmRecords.find((r) => r.seed.category === "dugun-salonu")!;
  const eventDate = new Date(Date.now() + 120 * 24 * 3600 * 1000);

  const request = await prisma.offerRequest.create({
    data: {
      coupleId: couple.id,
      categorySlug: "dugun-salonu",
      districtSlug: "kocasinan",
      guests: 400,
      eventDate,
      budget: 350000,
      note: "Cumartesi akşamı, 400 kişilik düğün salonu arıyoruz.",
      status: "MATCHED",
    },
  });

  // Üç salon firması teklif versin
  const venueFirms = firmRecords.filter((r) => r.seed.category === "dugun-salonu").slice(0, 3);
  let acceptedOffer: { id: string; firmId: string; price: number } | null = null;
  for (const vf of venueFirms) {
    const price = (vf.seed.pricePerGuest ?? 760) * 400;
    const offer = await prisma.offer.create({
      data: {
        requestId: request.id,
        firmId: vf.id,
        price,
        message: "Talebiniz için teklifimizi ilettik, detayları mesajdan görüşebiliriz.",
        status: vf.id === venueFirm.id ? "ACCEPTED" : "SENT",
        validUntil: new Date(Date.now() + 14 * 24 * 3600 * 1000),
      },
    });
    const thread = await prisma.thread.create({
      data: { offerId: offer.id, coupleId: couple.id, firmId: vf.id },
    });
    await prisma.message.create({
      data: { threadId: thread.id, senderId: couple.id, body: "Merhaba, menüde çocuk menüsü var mı?" },
    });
    if (vf.id === venueFirm.id) acceptedOffer = { id: offer.id, firmId: vf.id, price };
  }

  if (acceptedOffer) {
    const total = acceptedOffer.price;
    const reservation = await prisma.reservation.create({
      data: {
        offerId: acceptedOffer.id,
        coupleId: couple.id,
        firmId: acceptedOffer.firmId,
        totalAmount: total,
        depositAmount: calcDeposit(total),
        commissionAmount: calcCommission(total),
        eventDate,
        status: "COMPLETED",
        completedAt: new Date(),
        deposit: {
          create: {
            amount: calcDeposit(total),
            status: "RELEASED",
            provider: "iyzico",
            providerRef: "DEMO-ESCROW-0001",
            releasedAt: new Date(),
          },
        },
        review: {
          create: {
            firmId: acceptedOffer.firmId,
            coupleId: couple.id,
            rating: 5,
            body: "Her şey kusursuzdu, kaparo süreci çok güven vericiydi. Tavsiye ederiz!",
          },
        },
      },
    });
    console.log(`  ✓ Örnek rezervasyon tamamlandı: ${reservation.id}`);
  }

  // Çift araçları: 17 adımlık Kayseri ajanda şablonu (ilk birkaçı)
  const agendaTemplate = [
    "Bütçe belirle ve düğün tarihini seç",
    "Düğün salonu / kır düğünü mekanını araştır ve teklif al",
    "Nikah dairesinden gün al (Kayseri Belediyesi)",
    "Fotoğrafçı ve video ekibini ayarla",
    "Gelinlik ve damatlık provalarına başla",
    "Davetli listesini çıkar",
    "Davetiyeleri bastır ve dağıt",
    "Müzik / orkestra / DJ anlaşması yap",
    "Kına gecesi mekanı ve organizasyonu",
    "Gelin arabası ve süsleme",
    "Kuaför ve makyaj denemesi",
    "Catering menüsünü kesinleştir",
    "Takı ve alyans alımı",
    "Pasta ve nikah şekeri siparişi",
    "Balayı planı ve rezervasyon",
    "Oturma planını hazırla",
    "Son provalar ve ödemelerin tamamlanması",
  ];
  await prisma.agendaItem.createMany({
    data: agendaTemplate.map((title, idx) => ({
      coupleId: couple.id,
      title,
      sort: idx,
      done: idx < 3,
    })),
  });

  // Örnek bütçe kalemleri
  await prisma.budgetItem.createMany({
    data: [
      { coupleId: couple.id, category: "Mekan & Yemek", planned: 300000, actual: 304000, paid: true },
      { coupleId: couple.id, category: "Fotoğraf & Video", planned: 30000, actual: 0 },
      { coupleId: couple.id, category: "Gelinlik & Damatlık", planned: 40000, actual: 0 },
      { coupleId: couple.id, category: "Müzik", planned: 20000, actual: 0 },
      { coupleId: couple.id, category: "Süsleme & Çiçek", planned: 15000, actual: 0 },
    ],
  });

  // Kampanyalar / Fırsatlar (dugunbuketi "Kampanyalar" hub'ı benzeri)
  const byCat = (cat: string) => firmRecords.find((r) => r.seed.category === cat);
  const campaignDefs: {
    cat: string;
    title: string;
    description: string;
    dealLabel: string;
    district?: string;
    days: number;
  }[] = [
    { cat: "dugun-salonu", title: "Hafta içi düğün fırsatı", description: "Pazartesi–Perşembe günleri rezervasyonlarda özel kişi başı fiyat. Sınırlı tarih.", dealLabel: "Kişi başı 650 TL'den", district: "kocasinan", days: 45 },
    { cat: "havuz-basi", title: "Erken rezervasyon indirimi", description: "2026 sezonu havuz başı düğünlerinde erken rezervasyona özel indirim.", dealLabel: "%15 indirim", district: "melikgazi", days: 60 },
    { cat: "otel-dugunu", title: "Kış düğünü paketi", description: "Kasım–Şubat düğünlerinde çifte ücretsiz balayı süiti ve pasta hediye.", dealLabel: "Ücretsiz süit + pasta", district: "kocasinan", days: 90 },
    { cat: "tarihi-mekan", title: "Tarihi mekanda nikah + kına", description: "Nikah ve kına gecesini birlikte rezerve edene dekorasyon hediyeli paket.", dealLabel: "Dekor hediye", district: "incesu", days: 30 },
    { cat: "kir-dugunu", title: "Dış çekim hediyeli kır düğünü", description: "Kır düğünü rezervasyonunda profesyonel dış çekim fotoğraf paketi hediye.", dealLabel: "Dış çekim hediye", district: "melikgazi", days: 40 },
    { cat: "sosyal-tesis", title: "Toplu davet özel fiyatı", description: "200 kişi ve üzeri nişan/sünnet davetlerinde kurumsal özel fiyat.", dealLabel: "200+ kişi özel fiyat", district: "develi", days: 50 },
  ];
  let campaignCount = 0;
  for (const c of campaignDefs) {
    const fr = byCat(c.cat);
    if (!fr) continue;
    await prisma.campaign.create({
      data: {
        firmId: fr.id,
        title: c.title,
        description: c.description,
        dealLabel: c.dealLabel,
        districtSlug: c.district ?? null,
        validUntil: new Date(Date.now() + c.days * 24 * 3600 * 1000),
        active: true,
      },
    });
    campaignCount++;
  }
  console.log(`  ✓ ${campaignCount} kampanya oluşturuldu`);

  const counts = {
    kullanıcı: await prisma.user.count(),
    firma: await prisma.firmProfile.count(),
    kampanya: await prisma.campaign.count(),
    teklifTalebi: await prisma.offerRequest.count(),
    teklif: await prisma.offer.count(),
    rezervasyon: await prisma.reservation.count(),
  };
  console.log("✅ Seed tamamlandı:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
