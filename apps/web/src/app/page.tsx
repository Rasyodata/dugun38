import Link from "next/link";
import { CATEGORIES, DISTRICTS, VENUE_CATEGORIES, SERVICE_CATEGORIES } from "@dugun38/core";
import { SearchBox } from "@/components/SearchBox";
import { FirmCard } from "@/components/FirmCard";
import { featuredFirms } from "@/lib/firms";

export default async function HomePage() {
  const firms = await featuredFirms(8);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-brand-50 to-white">
        <div className="container-x py-14 md:py-20">
          <div className="max-w-3xl">
            <span className="badge bg-brand-100 text-brand-700 mb-4">Kayseri'nin düğün platformu · 16 ilçe · 286 firma</span>
            <h1 className="text-4xl md:text-5xl font-bold text-ink leading-tight">
              Bir gün değil,<br />bir ömür hatırlanacak <span className="text-brand-600 italic">bir hikâye.</span>
            </h1>
            <p className="text-lg text-muted mt-4">
              En özel gününüzü içinize sinen şekilde planlayın. Kayseri'deki mekanları keşfedin, ilham alın,
              tüm hizmetlerden tek formla teklif alın; <strong className="text-ink">Güvenli Kaparo</strong> ile güvenle rezerve edin.
            </p>
          </div>

          <div className="mt-8">
            <SearchBox />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-muted">Popüler:</span>
            {["dugun-salonu", "kir-dugunu", "fotograf-video", "gelinlik"].map((slug) => {
              const c = CATEGORIES.find((x) => x.slug === slug)!;
              return (
                <Link key={slug} href={`/kategori/${slug}`} className="badge bg-white border border-line hover:border-brand-400 text-ink">
                  {c.icon} {c.name}
                </Link>
              );
            })}
            <Link href="/asistan" className="badge bg-brand-600 text-white">✨ Duviora AI ile planla</Link>
          </div>
        </div>
      </section>

      {/* Kategoriler */}
      <section className="container-x py-12">
        <SectionHead title="Mekanlar" href="/mekanlar" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
          {VENUE_CATEGORIES.map((c) => (
            <CategoryTile key={c.slug} slug={c.slug} name={c.name} icon={c.icon} />
          ))}
        </div>

        <div className="mt-10">
          <SectionHead title="Hizmetler" href="/hizmetler" />
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
            {SERVICE_CATEGORIES.slice(0, 15).map((c) => (
              <CategoryTile key={c.slug} slug={c.slug} name={c.name} icon={c.icon} />
            ))}
          </div>
        </div>
      </section>

      {/* Vitrin firmalar */}
      <section className="container-x py-6">
        <SectionHead title="Öne çıkan firmalar" href="/arama" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-4">
          {firms.map((f) => (
            <FirmCard key={f.slug} firm={f} />
          ))}
        </div>
      </section>

      {/* Neden Duviora */}
      <section className="bg-cream mt-12">
        <div className="container-x py-14">
          <h2 className="text-2xl font-bold text-center text-ink">Neden Duviora?</h2>
          <p className="text-muted text-center mt-2">Düğün.com'da olmayan üç şey bizde standart.</p>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            <Feature icon="📨" title="Platform içi teklif" desc="Talebini bir kez gir; uygun firmalar fiyat versin, teklifleri yan yana karşılaştır. Telefonla uğraşma." />
            <Feature icon="🔒" title="Güvenli Kaparo" desc="Kaparon lisanslı ödeme kuruluşunda bekler; hizmeti aldıktan sonra firmaya geçer. İtirazda biz araya gireriz." />
            <Feature icon="⭐" title="Gerçek yorumlar" desc="Sadece platformdan rezervasyon yapıp hizmet alan çiftler yorum yazabilir. Sahte yorum yok." />
          </div>
        </div>
      </section>

      {/* İlçeler (SEO) */}
      <section className="container-x py-14">
        <h2 className="text-2xl font-bold text-ink">Kayseri'nin 16 ilçesinde</h2>
        <p className="text-muted mt-2">İlçenizdeki düğün salonu ve hizmetleri keşfedin.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6">
          {DISTRICTS.map((d) => (
            <Link
              key={d.slug}
              href={`/kategori/dugun-salonu/${d.slug}`}
              className="card px-4 py-3 text-sm hover:border-brand-400 flex items-center justify-between"
            >
              <span>{d.name}</span>
              {d.central && <span className="badge bg-brand-50 text-brand-700">merkez</span>}
            </Link>
          ))}
        </div>
      </section>

      {/* Firma CTA */}
      <section className="bg-brand-700 text-white">
        <div className="container-x py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold">Firmanızı ücretsiz ekleyin</h2>
            <p className="text-brand-100 mt-2">
              Profil ücretsiz. Sadece rezervasyon kazandığınızda %2 komisyon ödersiniz. Yıllık üyelik yok.
            </p>
          </div>
          <Link href="/kayit?rol=firma" className="btn bg-white text-brand-700 hover:bg-brand-50">
            Firma Olarak Katıl
          </Link>
        </div>
      </section>
    </>
  );
}

function SectionHead({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      <Link href={href} className="text-sm text-brand-700 font-medium hover:underline">Tümünü gör →</Link>
    </div>
  );
}

function CategoryTile({ slug, name, icon }: { slug: string; name: string; icon: string }) {
  return (
    <Link href={`/kategori/${slug}`} className="card p-4 text-center hover:border-brand-400 hover:shadow-sm transition">
      <div className="text-3xl">{icon}</div>
      <div className="text-sm font-medium mt-2 text-ink">{name}</div>
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
