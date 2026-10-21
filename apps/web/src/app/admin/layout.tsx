import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  if (user.role !== "ADMIN") redirect("/");

  const nav = [
    { href: "/admin", label: "Özet", icon: "📊" },
    { href: "/admin/loglar", label: "Kullanıcı Logları", icon: "📜" },
    { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: "👥" },
    { href: "/admin/firmalar", label: "Firmalar", icon: "🏢" },
  ];

  return (
    <div className="container-x py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-ink">🛡️ Yönetim Paneli</h1>
        <span className="text-xs text-muted">{user.name}</span>
      </div>
      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        <aside className="h-fit lg:sticky lg:top-20">
          <nav className="card p-2 space-y-0.5">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="block px-3 py-2 rounded-lg text-sm hover:bg-cream text-ink">
                {n.icon} {n.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
