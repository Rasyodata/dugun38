# Düğün38 — Kayseri'nin Düğün Platformu

Kayseri'ye özel düğün pazar yeri (Düğün.com'un yerel rakibi). İki kaynak brief'ten
üretildi: `01-is-gelistirme-raporu.md` ve `02-rakip-analizi.pdf`.

**Fark yaratan 3 özellik:** platform içi teklif akışı · Güvenli Kaparo (escrow) · gerçek yorumlar.

## Teknoloji

pnpm monorepo + TypeScript:

- `apps/web` — **Next.js 16** (App Router, SSR/SEO), Tailwind v4 — web uygulaması + API
- `packages/db` — **Prisma + SQLite** (PostgreSQL'e geçiş: sadece datasource değişir)
- `packages/core` — ortak domain (16 ilçe, 20 kategori, iş kuralları, zod doğrulama) — web + mobil paylaşır
- `apps/mobile` — **Expo / React Native** (Android + iOS, tek kod tabanı) — web API'sini kullanır
- `legacy/` — platformdan gelen eski iskelet (kullanılmıyor)

## Kurulum ve çalıştırma

```bash
# 1. Bağımlılıklar (ilk kez build script onayı gerekirse: pnpm approve-builds --all)
pnpm install

# 2. Veritabanını kur + demo veriyle doldur
pnpm db:push
pnpm db:seed

# 3. Geliştirme sunucusu
pnpm dev          # http://localhost:3000  (meşgulse: cd apps/web && pnpm exec next dev -p 3400)
```

Üretim derlemesi: `pnpm build` · Şema değişince: `pnpm db:push` · Sıfırla: `pnpm db:reset`

## Demo hesaplar

| Rol | E-posta | Şifre |
|-----|---------|-------|
| Çift | `cift@dugun38.local` | `cift1234` |
| Firma | `firma1@dugun38.local` … `firma12@…` | `firma1234` |
| Yönetici | `admin@dugun38.local` | `admin1234` |

## Faz 1'de hazır olanlar ✅

- **16 ilçe × 20 kategori = 320 SEO sayfası** (dinamik rota + sitemap + metadata)
- Tek arama kutusu + filtreler (kategori, ilçe, kapasite, fiyat, tarih) + 5 sıralama
- Firma detay (galeri, paketler, yorumlar) — **iletişim bilgisi rezervasyona kadar gizli**
- **Platform içi teklif akışı**: tek form → eşleşen firmalar (SMS test modu) → teklifler yan yana → kabul
- **Güvenli Kaparo** (test modu): %20 kaparo → DEPOSIT_HELD → hizmet onayı/itiraz → firmaya aktar / admin karar
- Yorumlar yalnız tamamlanmış rezervasyondan · %2 komisyon modeli
- Firma paneli (ücretsiz profil, hizmet bölgeleri, gelen talepler, teklif verme, istatistik)
- Admin paneli (metrikler + itiraz karara bağlama)
- Çift araçları: 17 adımlık Kayseri ajandası, bütçe, davetli listesi, favoriler
- KVKK (aydınlatma, gizlilik, çerez, kullanım koşulları) + **panelden hesap silme (anonimleştirme)**
- **Güvenlik**: scrypt parola hash, httpOnly session cookie, rol tabanlı erişim (RBAC),
  zod doğrulama, rate limit, güvenlik başlıkları (CSP/HSTS-ready), audit log

## Mobil uygulama (Android + iOS) 📱

Tek Expo/React Native kod tabanı, `packages/core`'u web ile paylaşır, web API'sine bağlanır.
Ekranlar: Ara (kategori/ilçe filtreli canlı firma listesi), Firma detay, Teklif Al, Giriş, Hesabım.
Android Hermes bundle **başarıyla derlendi** (`expo export` ✓).

```bash
cd apps/mobile
pnpm start                 # Metro başlar, QR kod verir
#  → Telefonunuza "Expo Go" kurun, QR'ı okutun (telefon + bilgisayar aynı Wi-Fi'de)
pnpm android               # Android emülatör/cihaz
pnpm ios                   # iOS (macOS gerekir) veya Expo Go
```

> API adresi `apps/mobile/app.json` → `expo.extra.apiBaseUrl`. Şu an canlı tünele bakıyor.
> Aynı Wi-Fi'de test için `http://192.168.1.234:3401`, üretimde kendi domaininizle değiştirin.
> **Not:** Expo + pnpm için kökte `node-linker=hoisted` (`.npmrc` + `pnpm-workspace.yaml`) gereklidir.

Mağazaya çıkış: `eas build` (Expo Application Services) ile `.aab` (Google Play) ve `.ipa` (App Store).

## Sırada (Faz 2)

Gerçek iyzico Pazaryeri escrow (6493 teyidi), gerçek SMS sağlayıcı, AI asistan (Claude API),
fotoğraf yükleme, rezervasyon özeti PDF, canlı mesajlaşma, dolu tarih takvimi.
Mobilde: teklif karşılaştırma + rezervasyon/kaparo ekranları (backend hazır), push bildirim.

> İş geliştirme notu (rapordan): Kod artık rekabeti kazandıran şey değil — **Kayseri'de sahada
> gerçek firma toplamak** asıl iş. Platform bunu destekleyecek şekilde hazır.
