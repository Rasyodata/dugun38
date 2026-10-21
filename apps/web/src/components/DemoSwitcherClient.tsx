"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@dugun38/core";

const ROLES: { role: Role; label: string; icon: string; dest: string }[] = [
  { role: "COUPLE", label: "Çift", icon: "👰", dest: "/hesabim" },
  { role: "FIRM", label: "Firma", icon: "🏢", dest: "/firma-paneli" },
  { role: "ADMIN", label: "Yönetici", icon: "🛡️", dest: "/admin" },
];

export function DemoSwitcherClient({ role, name }: { role: Role | null; name: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function switchTo(r: Role, dest: string) {
    setBusy(true);
    await fetch("/api/auth/demo-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: r }),
    });
    setBusy(false);
    router.push(dest);
    router.refresh();
  }

  async function logout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setBusy(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="card shadow-2xl p-3 w-56 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-brand-700">🎬 DEMO · Rol değiştir</span>
            <button onClick={() => setOpen(false)} className="text-muted text-sm">✕</button>
          </div>
          <p className="text-xs text-muted mb-2">
            {role ? `Şu an: ${ROLES.find((x) => x.role === role)?.label ?? role}${name ? ` (${name})` : ""}` : "Giriş yapılmadı"}
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {ROLES.map((r) => (
              <button
                key={r.role}
                onClick={() => switchTo(r.role, r.dest)}
                disabled={busy}
                className={`rounded-lg p-2 text-center text-xs font-semibold border disabled:opacity-60 ${
                  role === r.role ? "bg-brand-600 text-white border-brand-600" : "bg-white border-line text-ink hover:border-brand-400"
                }`}
              >
                <div className="text-lg">{r.icon}</div>
                {r.label}
              </button>
            ))}
          </div>
          {role && (
            <button onClick={logout} disabled={busy} className="w-full mt-2 text-xs text-muted hover:text-brand-700">
              Çıkış yap
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="btn btn-primary shadow-2xl rounded-full text-sm"
        >
          🎬 Demo
        </button>
      )}
    </div>
  );
}
