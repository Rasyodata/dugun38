import Constants from "expo-constants";
import type { SortKey } from "@dugun38/core";

// API tabanı app.json > expo.extra.apiBaseUrl'den gelir (canlı web backend).
const BASE: string =
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ??
  "http://localhost:3000";

export const apiBaseUrl = BASE;

// Basit oturum token saklama (bellek içi). Üretimde expo-secure-store ile kalıcı yapılır.
let authToken: string | null = null;
export function setToken(t: string | null) {
  authToken = t;
}
export function getToken() {
  return authToken;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(options.headers as Record<string, string>) };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Hata ${res.status}`);
  return data as T;
}

export interface FirmSummary {
  slug: string;
  businessName: string;
  categorySlug: string;
  about: string | null;
  minPrice: number | null;
  pricePerGuest: number | null;
  capacity: number | null;
  ratingAvg: number;
  ratingCount: number;
  showcase: boolean;
  responseMedianMin: number | null;
  districts: string[];
  imageUrl: string | null;
}

export interface FirmDetail extends Omit<FirmSummary, "imageUrl"> {
  maxPrice: number | null;
  verified: boolean;
  media: { url: string; alt: string | null }[];
  packages: { name: string; price: number; description: string | null }[];
  reviews: { name: string; rating: number; body: string | null }[];
}

export interface SessionUser {
  id: string;
  role: "COUPLE" | "FIRM" | "ADMIN";
  name: string;
  email: string;
}

export interface OfferItem {
  id: string;
  price: number;
  message: string | null;
  status: string;
  firm: { businessName: string; slug: string; ratingAvg: number; ratingCount: number; responseMedianMin: number | null };
  reservationId: string | null;
}
export interface OfferRequestItem {
  id: string;
  categorySlug: string;
  districtSlug: string;
  guests: number | null;
  eventDate: string;
  budget: number | null;
  note: string | null;
  status: string;
  offers: OfferItem[];
}

export interface FirmDashboard {
  hasProfile: boolean;
  businessName?: string;
  slug?: string;
  categorySlug?: string;
  ratingAvg?: number;
  ratingCount?: number;
  districts?: string[];
  openRequests?: number;
  offersSent?: number;
  reservations?: number;
  netEarned?: number;
}
export interface FirmRequestItem {
  id: string;
  districtSlug: string;
  guests: number | null;
  eventDate: string;
  budget: number | null;
  note: string | null;
  myOffer: { price: number; status: string } | null;
}

export interface AdminDispute {
  id: string; firmName: string; coupleName: string; depositAmount: number; reason: string | null;
}
export interface AdminOverview {
  users: number; firms: number; requests: number; reservations: number;
  gmv: number; commission: number; disputes: AdminDispute[];
}
export interface AdminLog {
  id: string; action: string; ip: string | null; meta: string | null;
  createdAt: string; userName: string | null; userRole: string | null;
}
export interface CoupleTools {
  agenda: { id: string; title: string; done: boolean }[];
  budget: { id: string; category: string; planned: number; actual: number; paid: boolean }[];
  budgetTotals: { planned: number; actual: number };
  guests: { total: number; attending: number };
}

export interface ThreadSummary {
  id: string; otherParty: string; context: string; offerPrice: number;
  hasReservation: boolean; unread: number; lastMessage: string | null; lastAt: string;
}
export interface ChatMessage { id: string; mine: boolean; body: string; createdAt: string }
export interface ThreadDetail {
  id: string; otherParty: string; offerPrice: number;
  canRevealContact: boolean; firmPhone: string | null; messages: ChatMessage[];
}

export type ReservationStatus = "PENDING_DEPOSIT" | "DEPOSIT_HELD" | "COMPLETED" | "DISPUTED" | "REFUNDED" | "CANCELLED";
export interface ReservationListItem {
  id: string;
  firmName: string;
  firmSlug: string;
  totalAmount: number;
  depositAmount: number;
  eventDate: string;
  status: ReservationStatus;
  hasReview: boolean;
}
export interface ReservationDetail extends ReservationListItem {
  commissionAmount: number;
  firmPhone: string | null;
  disputeReason: string | null;
  deposit: { status: string } | null;
}

export const api = {
  searchFirms(params: { category?: string; district?: string; guests?: number; sort?: SortKey; page?: number }) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v != null && v !== "") qs.set(k, String(v));
    return request<{ firms: FirmSummary[]; total: number; page: number }>(`/api/firms?${qs.toString()}`);
  },
  getFirm(slug: string) {
    return request<FirmDetail>(`/api/firms/${slug}`);
  },
  async login(email: string, password: string) {
    const r = await request<{ token: string; user: SessionUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(r.token);
    return r.user;
  },
  async demoLogin(role: "COUPLE" | "FIRM" | "ADMIN") {
    const r = await request<{ token: string; user: SessionUser }>("/api/auth/demo-login", {
      method: "POST",
      body: JSON.stringify({ role }),
    });
    setToken(r.token);
    return r.user;
  },
  me() {
    return request<{ user: SessionUser | null }>("/api/auth/me");
  },
  createOfferRequest(body: { category: string; district: string; guests?: number; eventDate: string; budget?: number; note?: string }) {
    return request<{ requestId: string; matchedCount: number }>("/api/offer-requests", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  myOfferRequests() {
    return request<{ requests: OfferRequestItem[] }>("/api/offer-requests");
  },
  acceptOffer(offerId: string) {
    return request<{ reservationId: string; depositAmount: number }>(`/api/offers/${offerId}/accept`, { method: "POST" });
  },
  listReservations() {
    return request<{ reservations: ReservationListItem[] }>("/api/reservations");
  },
  getReservation(id: string) {
    return request<ReservationDetail>(`/api/reservations/${id}`);
  },
  payDeposit(id: string) {
    return request<{ status: string }>(`/api/reservations/${id}/deposit`, { method: "POST" });
  },
  completeReservation(id: string) {
    return request<{ status: string }>(`/api/reservations/${id}/complete`, { method: "POST" });
  },
  disputeReservation(id: string, reason: string) {
    return request<{ status: string }>(`/api/reservations/${id}/dispute`, { method: "POST", body: JSON.stringify({ reason }) });
  },
  submitReview(reservationId: string, rating: number, body?: string) {
    return request<{ ok: boolean }>("/api/reviews", { method: "POST", body: JSON.stringify({ reservationId, rating, body }) });
  },
  // --- Firma tarafı ---
  firmDashboard() {
    return request<FirmDashboard>("/api/firm/dashboard");
  },
  firmRequests() {
    return request<{ requests: FirmRequestItem[] }>("/api/firm/requests");
  },
  sendOffer(requestId: string, price: number, message?: string) {
    return request<{ offerId: string }>("/api/offers", { method: "POST", body: JSON.stringify({ requestId, price, message }) });
  },
  // --- Çift paneli ---
  listFavorites() {
    return request<{ firms: FirmSummary[] }>("/api/favorites");
  },
  coupleTools() {
    return request<CoupleTools>("/api/couple/tools");
  },
  toggleAgenda(id: string, done: boolean) {
    return request<{ ok: boolean }>("/api/agenda/toggle", { method: "POST", body: JSON.stringify({ id, done }) });
  },
  // --- Mesajlaşma ---
  listThreads() {
    return request<{ threads: ThreadSummary[] }>("/api/threads");
  },
  getThread(id: string) {
    return request<ThreadDetail>(`/api/threads/${id}`);
  },
  sendMessage(threadId: string, body: string) {
    return request<{ id: string; createdAt: string }>("/api/messages", {
      method: "POST",
      body: JSON.stringify({ threadId, body }),
    });
  },
  // --- Admin paneli ---
  adminOverview() {
    return request<AdminOverview>("/api/admin/overview");
  },
  adminLogs(page = 1, action = "") {
    const qs = new URLSearchParams({ page: String(page) });
    if (action) qs.set("action", action);
    return request<{ total: number; page: number; logs: AdminLog[] }>(`/api/admin/logs?${qs.toString()}`);
  },
  resolveDispute(id: string, decision: "release" | "refund") {
    return request<{ ok: boolean }>(`/api/admin/disputes/${id}/resolve`, { method: "POST", body: JSON.stringify({ decision }) });
  },
  mediaUrl(path: string | null) {
    if (!path) return null;
    return path.startsWith("http") ? path : `${BASE}${path}`;
  },
};
