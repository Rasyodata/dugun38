import Link from "next/link";
import { CATEGORIES, DISTRICTS, VENUE_CATEGORIES, SERVICE_CATEGORIES } from "@dugun38/core";
import { SearchBox } from "@/components/SearchBox";
import { FirmCard } from "@/components/FirmCard";
import { featuredFirms, firmCountsByCategory } from "@/lib/firms";

export default async function HomePage() {
  const [firms, counts] = await Promise.all([featuredFirms(8), firmCountsByCategory()]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative isolate overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/duviora-hero.jpg"
          alt="Kayseri'de Erciyes manzaralı düğün"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/35" />
        <div className="relative container-x pt-20 pb-12 md:pt-28 md:pb-16">
          <div className="max-w-2xl text-white">
            <span className="inline-block text-xs font-semibold tracking-[0.25em] uppercase text-white/75">
              Duviora · Kayseri
            </span>
            <h1 className="font-display text-4xl md:text-6xl leading-[1.05] mt-4">
              Bir gün değil,<br />bir ömür hatırlanacak <span className="italic text-brand-200">bir hikâye.</span>
            </h1>
            <p className="text-base md:text-lg text-white/85 mt-5 max-w-xl">
              En özel gününüzü içinize sinen şekilde planlayın. Kayseri&apos;nin 16 ilçesinde {total} firmayı keşfedin,
              ilham alın, tek formla teklif alın; <strong className="text-white">Güvenli Kaparo</strong> ile güvenle rezerve edin.
            </p>
          </div>

          <div className="mt-8 max-w-4xl">
            <SearchBox />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2.5 text-sm">
            <span className="text-white/70">Popüler:</span>
            {["dugun-salonu", "kir-dugunu", "fotograf-video", "gelinlik"].map((slug) => {
              const c = CATEGORIES.find((x) => x.slug === slug)!;
              return (
                <Link key={slug} href={`/kategori/${slug}`} className="badge bg-white/15 text-white backdrop-blur-sm hover:bg-white/25 border border-white/15">
                  {c.icon} {c.name}
                </Link>
              );
            })}
            <Link href="/asistan" className="badge bg-brand-600 text-white hover:bg-brand-700">✨ Duviora AI ile planla</Link>
          </div>
        </div>
      </section>

      {/* ───────── İstatistik bandı ───────── */}
      <section className="bg-forest text-white">
        <div className="container-x py-7 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <Stat value={total} label="Kayseri firması" />
          <Stat value={CATEGORIES.length} label="Hizmet kategorisi" />
          <Stat value={16} label="İlçe" />
          <Stat value="%100" label="Güvenli Kaparo" />
        </div>
      </section>

      {/* ───────── Kategoriler ───────── */}
      <section className="container-x py-14">
        <SectionHead eyebrow="Keşfet" title="Mekanlar" href="/mekanlar" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
          {VENUE_CATEGORIES.map((c) => (
            <CategoryTile key={c.slug} slug={c.slug} name={c.name} icon={c.icon} count={counts[c.slug]} />
          ))}
        </div>

        <div className="mt-12">
          <SectionHead eyebrow="Hizmetler" title="Düğün firmaları" href="/hizmetler" />
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-6">
            {SERVICE_CATEGORIES.slice(0, 15).map((c) => (
              <CategoryTile key={c.slug} slug={c.slug} name={c.name} icon={c.icon} count={counts[c.slug]} />
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Öne çıkan firmalar ───────── */}
      <section className="container-x pb-4">
        <SectionHead eyebrow="Özenle seçilmiş" title="Keşfedilmeyi bekleyen firmalar" href="/arama" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
          {firms.map((f) => (
            <FirmCard key={f.slug} firm={f} />
          ))}
        </div>
      </section>

      {/* ───────── Planlayıcı ───────── */}
      <section className="bg-cream mt-14">
        <div className="container-x py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/editorial-03.jpg" alt="Düğün planlama" className="h-full w-full object-cover" />
          </div>
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-700">Yalnızca firma bulmak değil</span>
            <h2 className="font-display text-3xl md:text-4xl text-ink mt-3 leading-tight">
              Hayal kurmaya daha çok, planlamaya daha az zaman ayır.
            </h2>
            <p className="text-muted mt-3 leading-relaxed max-w-lg">
              Tüm hazırlıkları tek yerden yönet: ajanda, tüm teklifler, bütçe, konukların ve unutulmaz günün.
            </p>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mt-6 max-w-lg">
              {[
                ["✅", "Akıllı görev listesi"],
                ["🎀", "Davetli & RSVP"],
                ["💰", "Bütçe kontrolü"],
                ["🪑", "Görsel masa planı"],
                ["❤️", "Favori firmalar"],
                ["📨", "Teklif & mesajlar"],
              ].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-2.5 text-sm text-ink">
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <Link href="/asistan" className="btn btn-primary mt-7 inline-flex">✨ Duviora AI ile planlamaya başla</Link>
          </div>
        </div>
      </section>

      {/* ───────── İlham galerisi ───────── */}
      <section className="container-x py-16">
        <SectionHead eyebrow="Fikir defteri" title="Kalbini çalan fikirler" href="/kesfet" />
        <div className="grid md:grid-cols-3 gap-5 mt-6">
          {[
            ["editorial-02.jpg", "Erciyes manzarasında sonsuz 'evet'", "kir-dugunu"],
            ["editorial-06.jpg", "Zamansız & romantik sofralar", "susleme-cicek"],
            ["editorial-08.jpg", "Modern davet konseptleri", "organizasyon"],
          ].map(([img, title, cat]) => (
            <Link key={img} href={`/kategori/${cat}`} className="group relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/brand/${img}`} alt={title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5">
                <span className="text-[11px] font-semibold tracking-widest uppercase text-white/70">İlham</span>
                <h3 className="font-display text-xl text-white mt-1 leading-snug">{title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ───────── Neden Duviora ───────── */}
      <section className="bg-cream">
        <div className="container-x py-16">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-700">Farkımız</span>
            <h2 className="font-display text-3xl md:text-4xl text-ink mt-3">Neden Duviora?</h2>
            <p className="text-muted mt-3">Sıradan bir firma listesi değil; uçtan uca güvenli bir düğün deneyimi.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            <Feature icon="📨" title="Platform içi teklif" desc="Talebini bir kez gir; uygun firmalar fiyat versin, teklifleri yan yana karşılaştır. Telefonla uğraşma." />
            <Feature icon="🔒" title="Güvenli Kaparo" desc="Kaparon lisanslı ödeme kuruluşunda bekler; hizmeti aldıktan sonra firmaya geçer. İtirazda biz araya gireriz." />
            <Feature icon="⭐" title="Gerçek yorumlar" desc="Sadece platformdan rezervasyon yapıp hizmet alan çiftler yorum yazabilir. Sahte yorum yok." />
          </div>
        </div>
      </section>

      {/* ───────── İlçeler (SEO) ───────── */}
      <section className="container-x py-16">
        <SectionHead eyebrow="Kayseri" title="16 ilçenin tamamında" href="/mekanlar" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6">
          {DISTRICTS.map((d) => (
            <Link
              key={d.slug}
              href={`/kategori/dugun-salonu/${d.slug}`}
              className="card px-4 py-3 text-sm hover:border-brand-400 hover:shadow-sm transition flex items-center justify-between"
            >
              <span>{d.name}</span>
              {d.central && <span className="badge bg-brand-50 text-brand-700">merkez</span>}
            </Link>
          ))}
        </div>
      </section>

      {/* ───────── Firma CTA ───────── */}
      <section className="bg-brand-700 text-white">
        <div className="container-x py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl">Hikâyelerin başladığı yerde sen de yerini al.</h2>
            <p className="text-brand-100 mt-2 max-w-xl">
              Firmanı tanıt, müşteri taleplerini yönet ve Duviora topluluğuna katıl. Profil ücretsiz; sadece rezervasyon
              kazandığında %2 komisyon. Yıllık üyelik yok.
            </p>
          </div>
          <Link href="/kayit?rol=firma" className="btn bg-white text-brand-700 hover:bg-brand-50 shrink-0">
            Firma Olarak Katıl
          </Link>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl md:text-4xl">{value}</div>
      <div className="text-xs md:text-sm text-white/65 mt-1">{label}</div>
    </div>
  );
}

function SectionHead({ eyebrow, title, href }: { eyebrow?: string; title: string; href: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && <span className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-700">{eyebrow}</span>}
        <h2 className="font-display text-2xl md:text-3xl text-ink mt-1">{title}</h2>
      </div>
      <Link href={href} className="text-sm text-brand-700 font-medium hover:underline shrink-0">Tümünü gör →</Link>
    </div>
  );
}

function CategoryTile({ slug, name, icon, count }: { slug: string; name: string; icon: string; count?: number }) {
  return (
    <Link href={`/kategori/${slug}`} className="card p-4 text-center hover:border-brand-400 hover:shadow-sm transition">
      <div className="text-3xl">{icon}</div>
      <div className="text-sm font-medium mt-2 text-ink">{name}</div>
      {count ? <div className="text-xs text-muted mt-0.5">{count} firma</div> : null}
    </Link>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="card p-6">
      <div className="text-3xl">{icon}</div>
      <h3 className="font-semibold text-lg mt-3 text-ink">{title}</h3>
      <p className="text-sm text-muted mt-2 leading-relaxed">{desc}</p>
    </div>
  );
}
