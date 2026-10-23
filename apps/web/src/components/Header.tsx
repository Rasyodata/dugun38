import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";

export async function Header() {
  const user = await getCurrentUser();

  const dashboardHref =
    user?.role === "FIRM" ? "/firma-paneli" : user?.role === "ADMIN" ? "/admin" : "/hesabim";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-line">
      <div className="container-x flex items-center justify-between h-16 gap-4">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-muted">
            <Link href="/mekanlar" className="hover:text-brand-700">Mekanlar</Link>
            <Link href="/hizmetler" className="hover:text-brand-700">Hizmetler</Link>
            <Link href="/kampanyalar" className="hover:text-brand-700">Kampanyalar</Link>
            <Link href="/teklif-al" className="hover:text-brand-700">Teklif Al</Link>
            <Link href="/asistan" className="hover:text-brand-700">Duviora AI</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <UserMenu name={user.name} role={user.role} dashboardHref={dashboardHref} />
          ) : (
            <>
              <Link href="/giris" className="btn btn-outline text-sm hidden sm:inline-flex">
                Giriş Yap
              </Link>
              <Link href="/kayit?rol=firma" className="btn btn-primary text-sm">
                Firma Girişi
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
