import "server-only";

// Basit bellek içi hız sınırlama (sabit pencere). Tek sunucu/MVP için yeterli;
// üretimde Redis'e taşınır. Kaba kuvvet girişlerini ve spam'i yavaşlatır.

interface Bucket {
  count: number;
  resetAt: number;
}
const store = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

/** Sayaç artırmadan mevcut durumu kontrol eder (kilitli mi?). */
export function peekLocked(key: string, limit: number): boolean {
  const b = store.get(key);
  if (!b || b.resetAt < Date.now()) return false;
  return b.count >= limit;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const b = store.get(key);
  if (!b || b.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
  }
  b.count++;
  if (b.count > limit) {
    return { ok: false, remaining: 0, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }
  return { ok: true, remaining: limit - b.count, retryAfterSec: 0 };
}

// Ara sıra eski kayıtları temizle
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store) if (v.resetAt < now) store.delete(k);
  }, 60_000).unref?.();
}
