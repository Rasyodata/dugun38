# Www (K030_RAPORU)

Bu proje **KAAN PLATFORM** üzerinden oluşturuldu. Kaynak modüller merkezi
Module Library'den gelir (arch: BİR KEZ GELİŞTİR — HER PROJEDE KULLAN).

> ⚠️ **ÖNCE `MANDATE.md`'yi oku** — bu proje bir brief/talimattan oluşturuldu; iş ona göre yürütülür.

## Amaç
Www — modül tabanlı iş uygulaması.

## Mimari
- Teknoloji: pnpm monorepo + TypeScript (varsayılan).
- Reusable modüller merkezi kütüphaneden kurulur; proje içinde fork edilmez.
- Projeye özel davranışlar `extensions/` altında override olarak yazılır.

## Aktif modüller
- `CORE.AUTH` — Authentication (Oturum açma, token, şifre yönetimi.)
- `CORE.USERS` — Users (Kullanıcı yönetimi.)

## Veritabanı (modül tabloları)
- CORE.AUTH: auth_session
- CORE.USERS: users

## Kurallar
1. Yeni özellik istenince önce Module Library'yi kontrol et; varsa kur, yoksa
   reusable ise yeni modül olarak tasarla (arch #18/#19/#45).
2. Çalışan kodu sebepsiz yeniden yazma; destructive migration'ı otomatik çalıştırma.
3. Her işlem bir Claude Job'tur; sonunda Installation Report üret.

## Mevcut durum (güncel)
Proje **Düğün38** olarak hayata geçti — Kayseri'ye özel düğün pazar yeri (kaynak:
`01-is-gelistirme-raporu.md`, `02-rakip-analizi.pdf`). Eski KAAN iskeleti `legacy/`'ye taşındı.

**Gerçek mimari (pnpm monorepo + TypeScript):**
- `apps/web` — Next.js 16 (App Router, Tailwind v4) · web + API. ÇALIŞIR.
- `packages/db` — Prisma + SQLite · `packages/core` — ortak domain (16 ilçe, 20 kategori, iş kuralları, zod)
- `apps/mobile` — Expo/React Native (Android+iOS) · henüz yok (Faz 3)

**Faz 1 TAMAM** (çalışır + güvenlik testli): 320 SEO sayfası, arama/filtre, platform içi teklif akışı,
Güvenli Kaparo (test modu), yorumlar, firma paneli, admin, çift araçları, KVKK, RBAC/rate-limit/CSP.
Çalıştırma: `pnpm install && pnpm db:push && pnpm db:seed && pnpm dev`. Detay: `README.md`.

**Sırada:** Faz 2 (gerçek iyzico escrow, SMS, AI asistan, foto yükleme, PDF, mesajlaşma) · Faz 3 (mobil).

## Devam etmek için
Platformdan "▶ CLAUDE İLE DEVAM ET" ile bu workspace'te `claude --continue` çalışır.
