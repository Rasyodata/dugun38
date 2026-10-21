import type { Metadata } from "next";
import { Bodoni_Moda } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

// Vogue arşivi benzeri editoryal Didone başlık yazı tipi (yüksek kontrastlı serif).
const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});
import { Footer } from "@/components/Footer";
import { DemoSwitcher } from "@/components/DemoSwitcher";
import { CookieConsent } from "@/components/CookieConsent";

export const metadata: Metadata = {
  metadataBase: new URL("https://dugun38.com"),
  title: {
    default: "Düğün38 — Kayseri'nin Düğün Platformu",
    template: "%s | Düğün38",
  },
  description:
    "Kayseri'nin 16 ilçesinde düğün salonu, kır düğünü, fotoğrafçı, gelinlik ve tüm düğün hizmetleri. Tek formla teklif al, Güvenli Kaparo ile güvenle rezervasyon yap.",
  keywords: ["Kayseri düğün", "düğün salonu Kayseri", "kır düğünü Kayseri", "Düğün38"],
  openGraph: {
    title: "Düğün38 — Kayseri'nin Düğün Platformu",
    description: "Kayseri'de düğününüzü planlayın: teklif alın, karşılaştırın, Güvenli Kaparo ile rezervasyon yapın.",
    locale: "tr_TR",
    type: "website",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Düğün38" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`h-full ${display.variable}`}>
      <body className="min-h-full flex flex-col bg-white">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <DemoSwitcher />
        <CookieConsent />
      </body>
    </html>
  );
}
