"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Role } from "@dugun38/core";

const ROLE_LABEL: Record<Role, string> = { COUPLE: "Çift", FIRM: "Firma", ADMIN: "Yönetici" };

export function UserMenu({ name, role, dashboardHref }: { name: string; role: Role; dashboardHref: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn btn-outline text-sm"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 inline-flex items-center justify-center font-bold">
          {name.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:inline max-w-28 truncate">{name}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-52 card shadow-lg py-1 z-20" role="menu">
            <div className="px-4 py-2 text-xs text-muted border-b border-line">
              {ROLE_LABEL[role]} hesabı
            </div>
            <Link href={dashboardHref} className="block px-4 py-2 text-sm hover:bg-cream" onClick={() => setOpen(false)}>
              Panelim
            </Link>
            {role === "COUPLE" && (
              <>
                <Link href="/hesabim/tekliflerim" className="block px-4 py-2 text-sm hover:bg-cream" onClick={() => setOpen(false)}>Tekliflerim</Link>
                <Link href="/hesabim/araclar" className="block px-4 py-2 text-sm hover:bg-cream" onClick={() => setOpen(false)}>Düğün Araçlarım</Link>
                <Link href="/favoriler" className="block px-4 py-2 text-sm hover:bg-cream" onClick={() => setOpen(false)}>Favorilerim</Link>
              </>
            )}
            <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-brand-700 hover:bg-cream">
              Çıkış Yap
            </button>
          </div>
        </>
      )}
    </div>
  );
}
