import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";
import { LoginLiveDashboard } from "./LoginLiveDashboard";
import { DemoLoginButtons } from "@/components/DemoLoginButtons";

export const metadata = { title: "Giriş Yap" };

export default async function GirisPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");
  const demo = process.env.ALLOW_DEMO_LOGIN === "1";

  return (
    <div className="grid lg:grid-cols-[1.05fr_1fr] min-h-[calc(100vh-4rem)]">
      {/* SOL: canlı platform paneli */}
      <LoginLiveDashboard />

      {/* SAĞ: giriş bilgileri */}
      <section className="order-1 lg:order-2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl text-ink">Giriş yap</h1>
          <p className="text-muted text-sm mt-2">Çift, firma ve yönetici hesapları için.</p>

          {demo && (
            <div className="card p-5 mt-6 bg-brand-50 border-brand-200">
              <DemoLoginButtons />
            </div>
          )}

          <div className="card p-6 mt-4">
            <LoginForm />
          </div>
          <p className="text-sm text-muted mt-4 text-center">
            Hesabın yok mu?{" "}
            <Link href="/kayit" className="text-brand-700 font-medium hover:underline">Üye ol</Link>
          </p>
          <div className="text-xs text-muted mt-6 bg-cream rounded-lg p-3 leading-relaxed">
            <strong>Demo hesaplar:</strong><br />
            Çift: cift@dugun38.local / cift1234<br />
            Firma: firma1@dugun38.local / firma1234<br />
            Yönetici: admin@dugun38.local / admin1234
          </div>
        </div>
      </section>
    </div>
  );
}
