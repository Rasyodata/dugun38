"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@dugun38/core";

const ROLES: { role: Role; label: string; icon: string; dest: string }[] = [
  { role: "COUPLE", label: "Çift Girişi", icon: "👰", dest: "/hesabim" },
  { role: "FIRM", label: "Firma Girişi", icon: "🏢", dest: "/firma-paneli" },
  { role: "ADMIN", label: "Yönetici Girişi", icon: "🛡️", dest: "/admin" },
];

export function DemoLoginButtons() {
  const router = useRouter();
  const [loading, setLoading] = useState<Role | null>(null);

  async function go(role: Role, dest: string) {
    setLoading(role);
    const res = await fetch("/api/auth/demo-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setLoading(null);
    if (res.ok) {
      router.push(dest);
      router.refresh();
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted text-center">Demo — şifresiz tek tıkla gir</p>
      <div className="grid grid-cols-3 gap-2">
        {ROLES.map((r) => (
          <button
            key={r.role}
            onClick={() => go(r.role, r.dest)}
            disabled={loading !== null}
            className="card p-3 text-center hover:border-brand-400 disabled:opacity-60"
          >
            <div className="text-2xl">{r.icon}</div>
            <div className="text-xs font-semibold text-ink mt-1">{loading === r.role ? "…" : r.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
