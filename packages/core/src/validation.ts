import { z } from "zod";
import { DISTRICT_BY_SLUG } from "./geo";
import { CATEGORY_BY_SLUG } from "./categories";

const districtSlug = z.string().refine((s) => s in DISTRICT_BY_SLUG, "Geçersiz ilçe");
const categorySlug = z.string().refine((s) => s in CATEGORY_BY_SLUG, "Geçersiz kategori");

/** Türk GSM: 5XXXXXXXXX (10 hane) ya da 05XX... — normalize edilir. */
export const phoneSchema = z
  .string()
  .transform((s) => s.replace(/\D/g, ""))
  .refine((s) => /^(0?5\d{9})$/.test(s), "Geçerli bir cep telefonu girin")
  .transform((s) => (s.length === 11 ? s.slice(1) : s)); // 5XXXXXXXXX

export const passwordSchema = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalı")
  .max(128, "Şifre çok uzun");

export const registerSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter").max(80),
  email: z.string().email("Geçerli bir e-posta girin").toLowerCase(),
  phone: phoneSchema,
  password: passwordSchema,
  role: z.enum(["COUPLE", "FIRM"]),
  kvkkAccepted: z.literal(true, { errorMap: () => ({ message: "KVKK aydınlatma metnini onaylamalısınız" }) }),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1, "Şifre gerekli"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const searchSchema = z.object({
  category: categorySlug.optional(),
  district: districtSlug.optional(),
  guests: z.coerce.number().int().positive().max(5000).optional(),
  venueType: z.string().optional(),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().nonnegative().optional(),
  date: z.string().optional(), // ISO yyyy-mm-dd
  sort: z.enum(["relevance", "rating", "price_asc", "price_desc", "response"]).default("relevance"),
  page: z.coerce.number().int().positive().default(1),
});
export type SearchInput = z.infer<typeof searchSchema>;

export const offerRequestSchema = z.object({
  category: categorySlug,
  district: districtSlug,
  guests: z.coerce.number().int().positive().max(5000).optional(),
  eventDate: z.string().min(1, "Düğün/etkinlik tarihi gerekli"),
  budget: z.coerce.number().positive().optional(),
  note: z.string().max(1000).optional(),
  // Üye değilse hızlı talep için iletişim (giriş yapınca otomatik dolar)
  name: z.string().min(2).max(80).optional(),
  phone: phoneSchema.optional(),
});
export type OfferRequestInput = z.infer<typeof offerRequestSchema>;

export const offerSchema = z.object({
  requestId: z.string().min(1),
  price: z.coerce.number().positive("Fiyat pozitif olmalı").max(100_000_000),
  message: z.string().max(2000).optional(),
  validUntil: z.string().optional(),
});
export type OfferInput = z.infer<typeof offerSchema>;

export const messageSchema = z.object({
  threadId: z.string().min(1),
  body: z.string().min(1, "Mesaj boş olamaz").max(2000),
});
export type MessageInput = z.infer<typeof messageSchema>;

export const firmProfileSchema = z.object({
  businessName: z.string().min(2, "Firma adı gerekli").max(120),
  categorySlug: categorySlug,
  about: z.string().max(3000).optional(),
  districts: z.array(districtSlug).min(1, "En az bir hizmet bölgesi seçin"),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  capacity: z.coerce.number().int().positive().optional(),
  pricePerGuest: z.coerce.number().nonnegative().optional(),
  phone: phoneSchema.optional(),
  address: z.string().max(300).optional(),
});
export type FirmProfileInput = z.infer<typeof firmProfileSchema>;
