import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Kayıt Ol" };

export default async function KayitPage({ searchParams }: PageProps<"/kayit">) {
  const user = await getCurrentUser();
  if (user) redirect("/");
  const sp = await searchParams;
  const defaultRole = sp.rol === "firma" ? "FIRM" : "COUPLE";

  return (
    <div className="container-x py-12 max-w-md">
      <h1 className="text-2xl font-bold text-ink">
        {defaultRole === "FIRM" ? "Firma hesabı oluştur" : "Üye ol"}
      </h1>
      <p className="text-muted text-sm mt-2">
        {defaultRole === "FIRM"
          ? "Profil ücretsiz. Sadece rezervasyon kazandığınızda %2 komisyon ödersiniz."
          : "Teklif al, favorilerini kaydet, düğün araçlarını kullan — çiftlere tamamen ücretsiz."}
      </p>
      <div className="card p-6 mt-6">
        <RegisterForm defaultRole={defaultRole} />
      </div>
      <p className="text-sm text-muted mt-4 text-center">
        Zaten hesabın var mı?{" "}
        <Link href="/giris" className="text-brand-700 font-medium hover:underline">Giriş yap</Link>
      </p>
    </div>
  );
}
