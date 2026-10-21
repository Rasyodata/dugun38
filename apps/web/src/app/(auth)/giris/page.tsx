import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";
import { DemoLoginButtons } from "@/components/DemoLoginButtons";

export const metadata = { title: "Giriş Yap" };

export default async function GirisPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");
  const demo = process.env.ALLOW_DEMO_LOGIN === "1";

  return (
    <div className="container-x py-12 max-w-md">
      <h1 className="text-2xl font-bold text-ink">Giriş yap</h1>
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
  );
}
