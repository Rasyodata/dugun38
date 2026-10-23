import Link from "next/link";
import { CATEGORIES } from "@dugun38/core";
import { Logo } from "./Logo";

export function Footer() {
  const topCats = CATEGORIES.slice(0, 8);
  return (
    <footer className="bg-forest text-white/75 mt-16">
      <div className="container-x py-12 grid gap-8 md:grid-cols-4">
        <div>
          <Logo tone="light" />
          <p className="text-sm text-white/60 mt-3 leading-relaxed">
            Kayseri'nin düğün platformu. 16 ilçede firma bul, teklif al, Güvenli Kaparo ile güvenle rezervasyon yap.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3 text-white">Kategoriler</h4>
          <ul className="space-y-1.5 text-sm text-white/65">
            {topCats.map((c) => (
              <li key={c.slug}>
                <Link href={`/kategori/${c.slug}`} className="hover:text-white">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3 text-white">Duviora</h4>
          <ul className="space-y-1.5 text-sm text-white/65">
            <li><Link href="/teklif-al" className="hover:text-white">Teklif Al</Link></li>
            <li><Link href="/kampanyalar" className="hover:text-white">Kampanyalar &amp; Fırsatlar</Link></li>
            <li><Link href="/asistan" className="hover:text-white">Duviora AI</Link></li>
            <li><Link href="/kesfet" className="hover:text-white">Düğün Rehberi (Keşfet)</Link></li>
            <li><Link href="/kayit?rol=firma" className="hover:text-white">Firma Olarak Katıl</Link></li>
            <li><Link href="/guvenli-kaparo" className="hover:text-white">Güvenli Kaparo Nedir?</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3 text-white">Yasal</h4>
          <ul className="space-y-1.5 text-sm text-white/65">
            <li><Link href="/kvkk" className="hover:text-white">KVKK Aydınlatma Metni</Link></li>
            <li><Link href="/gizlilik" className="hover:text-white">Gizlilik Politikası</Link></li>
            <li><Link href="/cerez" className="hover:text-white">Çerez Politikası</Link></li>
            <li><Link href="/kullanim-kosullari" className="hover:text-white">Kullanım Koşulları</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="container-x py-5 text-xs text-white/55 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Duviora · Kayseri (38)</span>
          <span>Çiftlerden hiçbir hizmet için ücret veya komisyon alınmaz.</span>
        </div>
      </div>
    </footer>
  );
}
