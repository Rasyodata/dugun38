import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/password.js";
import {
  DISTRICTS,
  calcDeposit,
  calcCommission,
} from "@dugun38/core";

const prisma = new PrismaClient();

function slugify(s: string): string {
  const map: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i" };
  return s
    .replace(/[çğıöşüİ]/g, (c) => map[c] ?? c)
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

const FIRMS: FirmSeed[] = [
  { business: "Hayal Evim Event Garden", category: "kir-dugunu", districts: ["melikgazi", "talas"], capacity: 700, pricePerGuest: 850, about: "Erciyes manzaralı bahçede kır düğünü ve kına organizasyonu.", showcase: true, rating: 4.8, ratingCount: 96 },
  { business: "My Berra Düğün ve Etkinlik Merkezi", category: "dugun-salonu", districts: ["kocasinan"], capacity: 600, pricePerGuest: 800, about: "Şehir merkezinde modern düğün salonu, profesyonel ekip.", showcase: true, rating: 4.6, ratingCount: 142 },
  { business: "Tulpar Binicilik & Davet", category: "kir-dugunu", districts: ["kocasinan", "incesu"], capacity: 900, pricePerGuest: 780, about: "Doğayla iç içe at çiftliğinde eşsiz düğün deneyimi.", rating: 4.7, ratingCount: 58 },
  { business: "Friesian Garden", category: "kir-dugunu", districts: ["talas"], capacity: 650, pricePerGuest: 720, about: "Talas'ta butik kır düğünü bahçesi.", rating: 4.5, ratingCount: 41 },
  { business: "Milena Düğün Salonu", category: "dugun-salonu", districts: ["kocasinan", "melikgazi"], capacity: 550, pricePerGuest: 760, about: "Ferah salon, zengin menü seçenekleri.", rating: 4.3, ratingCount: 77 },
  { business: "Erciyes Binicilik Balo & Davet Salonu", category: "dugun-salonu", districts: ["melikgazi"], capacity: 800, pricePerGuest: 790, about: "163 mutlu çiftin tercihi balo ve davet salonu.", showcase: true, rating: 4.9, ratingCount: 163 },
  { business: "Develi Bağ Evi Kır Düğünü", category: "kir-dugunu", districts: ["develi", "yahyali"], capacity: 400, pricePerGuest: 600, about: "Develi'de bağ evinde sade ve samimi düğün.", rating: 4.4, ratingCount: 19 },
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
        districts: { create: f.districts.map((d) => ({ districtSlug: d })) },
        media: {
          create: [0, 1, 2].map((n) => ({
            url: `/placeholders/${f.category}.svg`,
            alt: `${f.business} görsel ${n + 1}`,
            sort: n,
          })),
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

  const counts = {
    kullanıcı: await prisma.user.count(),
    firma: await prisma.firmProfile.count(),
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
