# Düğün38 — Hosting / Yayına Alma Rehberi

Üç yol var. İhtiyacınıza göre seçin.

---

## 0. Hızlı önizleme (şu an canlı)

Şu anda makinenizde **production** sunucu çalışıyor ve iki şekilde erişilebilir:

- **Aynı ağdaki cihazlardan** (telefon dahil): `http://192.168.1.234:3401`
- **İnternetten (geçici public HTTPS)**: cloudflared "quick tunnel" ile
  `https://<rastgele>.trycloudflare.com` — URL'yi `/tmp/tunnel_url.txt` dosyasında bulursunuz.

> ⚠️ Quick tunnel URL'si geçicidir (sunucu/tünel kapanınca kaybolur) ve sadece gösterim içindir.
> Kalıcı yayın için aşağıdaki seçeneklerden birini kullanın.

Önizlemeyi yeniden başlatmak için:
```bash
cd apps/web && pnpm build
INSECURE_COOKIES=1 pnpm exec next start -p 3401 -H 0.0.0.0 &
/tmp/cloudflared tunnel --url http://localhost:3401   # public HTTPS URL verir
```

---

## ⭐ Render (önerilen kalıcı yayın — repo hazır)

Kod GitHub'da: **https://github.com/Rasyodata/dugun38** (private). `render.yaml` Blueprint hazır.

**Tek-tık deploy:**
1. Şuraya git (Render'a giriş yapmış olun): **https://render.com/deploy?repo=https://github.com/Rasyodata/dugun38**
2. Render GitHub uygulamasına `Rasyodata/dugun38` deposuna erişim izni verin.
3. `render.yaml` otomatik algılanır → **Apply** / **Create** deyin.
4. İlk build ~5-8 dk sürer. Bitince `https://dugun38.onrender.com` (benzeri) adresiniz hazır.

**Ya da manuel:** Render Dashboard → **New → Blueprint** → `Rasyodata/dugun38` seç → Apply.

**Güncelleme:** Kodu değiştirip `git push` yapın → Render otomatik yeniden yayınlar (`autoDeploy: true`).
Bu makineden push: `git push` (remote `origin` ayarlı).

**Env (render.yaml'de hazır, Dashboard'dan değiştirilebilir):**
- `SEED_ON_BOOT=1` → ilk açılışta demo veriyle doldurur. Gerçek veri girince **`0`** yapın.
- `ALLOW_DEMO_LOGIN=1` → şifresiz demo giriş (sunum için). Tam canlıda **kaldırın/`0`**.

**Veri kalıcılığı:** Free plan diski geçicidir (her yeniden başlatmada SQLite sıfırlanır → `SEED_ON_BOOT=1` ile demo verisi geri gelir).
Kalıcı veri için: `render.yaml`'de `plan: starter` yapıp `disk:` bloğunu açın (aylık ücretli), ya da PostgreSQL'e geçin (bkz. Vercel bölümü — tek satır provider değişikliği).

---

## 1. Docker (kendi sunucunuz / VPS) — alternatif kalıcı yol

Tek komutla ayağa kalkar, SQLite verisi kalıcı volüme yazılır:

```bash
# Derle ve başlat
SITE_URL=https://alanadiniz.com docker compose up -d --build

# Günlükler
docker compose logs -f web
```

Sunucuda bir reverse proxy (Caddy/Nginx) ile HTTPS verin, `INSECURE_COOKIES`'i **ayarlamayın**
(böylece secure cookie aktif olur). Örnek Caddy:

```
alanadiniz.com {
    reverse_proxy localhost:3000
}
```

---

## 2. Vercel (en kolay — Next.js'in üreticisi)

Vercel SQLite dosya sistemine yazmayı kalıcı desteklemez; bu yüzden **PostgreSQL**'e geçin
(kod hazır, sadece provider değişir):

1. `packages/db/prisma/schema.prisma` → `datasource` provider'ını `postgresql` yapın.
2. Bir Postgres alın (Vercel Postgres / Neon / Supabase) ve `DATABASE_URL`'i Vercel env'e ekleyin.
3. Vercel projesinde **Root Directory = `apps/web`**, Build Command = `pnpm build`,
   Install Command = `pnpm install`.
4. Env: `DATABASE_URL`, `SITE_URL`. Deploy sonrası bir kez `pnpm --filter @dugun38/db push && seed`.

---

## 3. Railway / Render (Docker ile)

Repo'yu bağlayın, servis tipini **Docker** seçin (kök `Dockerfile` kullanılır). Kalıcı disk/volume
ekleyip `/app/packages/db/prisma` yoluna bağlayın veya PostgreSQL eklentisi kullanın.
Env: `SITE_URL`. HTTPS platform tarafından sağlanır → `INSECURE_COOKIES` ayarlamayın.

---

## Üretim öncesi kontrol listesi

- [ ] SQLite → PostgreSQL (çok kullanıcı/ölçek için) — tek satır provider değişikliği
- [ ] Gerçek domain + HTTPS (secure cookie otomatik aktifleşir)
- [ ] `iyzico` Pazaryeri gerçek anahtarları + 6493 sayılı kanun teyidi (Güvenli Kaparo)
- [ ] Gerçek SMS sağlayıcı anahtarları (`lib/notify.ts`)
- [ ] Yasal metinlerin avukat onayı (KVKK/gizlilik/çerez/kullanım)
- [ ] Rate-limit'i Redis'e taşı (çok sunuculu kurulumda)
