import Link from "next/link";
import { CATEGORIES } from "@dugun38/core";
import { Logo } from "./Logo";

export function Footer() {
  const topCats = CATEGORIES.slice(0, 8);
  return (
    <footer className="border-t border-line bg-cream mt-16">
      <div className="container-x py-12 grid gap-8 md:grid-cols-4">
        <div>
          <Logo />
          <p className="text-sm text-muted mt-3 leading-relaxed">
            Kayseri'nin düğün platformu. 16 ilçede firma bul, teklif al, Güvenli Kaparo ile güvenle rezervasyon yap.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Kategoriler</h4>
          <ul className="space-y-1.5 text-sm text-muted">
            {topCats.map((c) => (
              <li key={c.slug}>
                <Link href={`/kategori/${c.slug}`} className="hover:text-brand-700">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Düğün38</h4>
          <ul className="space-y-1.5 text-sm text-muted">
            <li><Link href="/teklif-al" className="hover:text-brand-700">Teklif Al</Link></li>
            <li><Link href="/asistan" className="hover:text-brand-700">AI Düğün Asistanı</Link></li>
            <li><Link href="/kayit?rol=firma" className="hover:text-brand-700">Firma Olarak Katıl</Link></li>
            <li><Link href="/guvenli-kaparo" className="hover:text-brand-700">Güvenli Kaparo Nedir?</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Yasal</h4>
          <ul className="space-y-1.5 text-sm text-muted">
            <li><Link href="/kvkk" className="hover:text-brand-700">KVKK Aydınlatma Metni</Link></li>
            <li><Link href="/gizlilik" className="hover:text-brand-700">Gizlilik Politikası</Link></li>
            <li><Link href="/cerez" className="hover:text-brand-700">Çerez Politikası</Link></li>
            <li><Link href="/kullanim-kosullari" className="hover:text-brand-700">Kullanım Koşulları</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x py-5 text-xs text-muted flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Düğün38 · Kayseri (38)</span>
          <span>Çiftlerden hiçbir hizmet için ücret veya komisyon alınmaz.</span>
        </div>
      </div>
    </footer>
  );
}
