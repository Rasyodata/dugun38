// Düğün38 iş kuralları — rakip analizi raporundaki modelden.

/** Firma ücreti: ücretsiz profil + rezervasyon başına %2 komisyon. */
export const COMMISSION_RATE = 0.02;

/** Güvenli Kaparo: toplam tutarın %20'si ödeme kuruluşunda bekler. */
export const DEPOSIT_RATE = 0.2;

/**
 * Kaparo serbest kalma kuralı: hizmet alındı işaretlenince ya da
 * düğün tarihinden sonra bu kadar gün içinde itiraz yoksa firmaya geçer.
 */
export const DEPOSIT_RELEASE_DAYS_AFTER_EVENT = 3;

/** Firma yanıt süresi hedefi (rapor: medyan < 6 saat). */
export const TARGET_RESPONSE_HOURS = 6;

/** Kullanıcı rolleri. */
export const ROLES = ["COUPLE", "FIRM", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

/** Teklif talebi durumları. */
export const OFFER_REQUEST_STATUS = ["OPEN", "MATCHED", "CLOSED", "EXPIRED"] as const;
export type OfferRequestStatus = (typeof OFFER_REQUEST_STATUS)[number];

/** Tek teklif durumları. */
export const OFFER_STATUS = ["SENT", "VIEWED", "ACCEPTED", "DECLINED", "WITHDRAWN"] as const;
export type OfferStatus = (typeof OFFER_STATUS)[number];

/** Rezervasyon durumları. */
export const RESERVATION_STATUS = [
  "PENDING_DEPOSIT", // kaparo bekleniyor
  "DEPOSIT_HELD", // kaparo escrow'da
  "COMPLETED", // hizmet alındı, kaparo firmaya geçti
  "DISPUTED", // itiraz var, admin karar verecek
  "REFUNDED", // çifte iade edildi
  "CANCELLED",
] as const;
export type ReservationStatus = (typeof RESERVATION_STATUS)[number];

/** Sıralama seçenekleri (rapor: "5 sıralama"). */
export const SORT_OPTIONS = [
  { key: "relevance", label: "Önerilen" },
  { key: "rating", label: "Puan (yüksek → düşük)" },
  { key: "price_asc", label: "Fiyat (düşük → yüksek)" },
  { key: "price_desc", label: "Fiyat (yüksek → düşük)" },
  { key: "response", label: "En hızlı yanıt veren" },
] as const;
export type SortKey = (typeof SORT_OPTIONS)[number]["key"];

/** TL biçimlendirme — web ve mobil ortak. */
export function formatTRY(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Komisyon ve kaparo hesapları. */
export function calcDeposit(total: number): number {
  return Math.round(total * DEPOSIT_RATE);
}
export function calcCommission(total: number): number {
  return Math.round(total * COMMISSION_RATE);
}
/** Firmanın eline geçen net (komisyon düşülmüş). */
export function calcFirmNet(total: number): number {
  return total - calcCommission(total);
}
