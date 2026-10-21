"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Role } from "@dugun38/core";

export function RegisterForm({ defaultRole }: { defaultRole: Role }) {
  const router = useRouter();
  const [role, setRole] = useState<"COUPLE" | "FIRM">(defaultRole === "FIRM" ? "FIRM" : "COUPLE");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      password: String(fd.get("password") ?? ""),
      role,
      kvkkAccepted: fd.get("kvkk") === "on",
    };
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Kayıt başarısız");
      return;
    }
    router.push(role === "FIRM" ? "/firma-paneli/profil?yeni=1" : "/hesabim");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2 p-1 bg-cream rounded-lg">
        {(["COUPLE", "FIRM"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`py-2 rounded-md text-sm font-medium transition ${
              role === r ? "bg-white shadow text-brand-700" : "text-muted"
            }`}
          >
            {r === "COUPLE" ? "👰 Çift" : "🏢 Firma"}
          </button>
        ))}
      </div>

      <L label={role === "FIRM" ? "Yetkili / Firma adı" : "Ad Soyad"}>
        <input name="name" required className="input" placeholder={role === "FIRM" ? "Örn. My Berra Davet" : "Örn. Ayşe Yılmaz"} />
      </L>
      <L label="E-posta">
        <input name="email" type="email" required className="input" placeholder="ornek@eposta.com" />
      </L>
      <L label="Cep telefonu">
        <input name="phone" required className="input" placeholder="5XX XXX XX XX" inputMode="numeric" />
      </L>
      <L label="Şifre">
        <input name="password" type="password" required minLength={8} className="input" placeholder="En az 8 karakter" />
      </L>

      <label className="flex items-start gap-2 text-sm text-muted">
        <input name="kvkk" type="checkbox" required className="mt-1" />
        <span>
          <Link href="/kvkk" target="_blank" className="text-brand-700 hover:underline">KVKK Aydınlatma Metni</Link>'ni
          okudum, kişisel verilerimin işlenmesini kabul ediyorum.
        </span>
      </label>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>}

      <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-60">
        {loading ? "Oluşturuluyor…" : "Hesap Oluştur"}
      </button>
    </form>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink mb-1">{label}</span>
      {children}
    </label>
  );
}
