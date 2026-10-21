"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Giriş başarısız");
      return;
    }
    const dest = data.user.role === "FIRM" ? "/firma-paneli" : data.user.role === "ADMIN" ? "/admin" : "/hesabim";
    router.push(dest);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="block text-sm font-medium text-ink mb-1">E-posta</span>
        <input name="email" type="email" required className="input" autoComplete="email" />
      </label>
      <label className="block">
        <span className="block text-sm font-medium text-ink mb-1">Şifre</span>
        <input name="password" type="password" required className="input" autoComplete="current-password" />
      </label>
      {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>}
      <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-60">
        {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
      </button>
    </form>
  );
}
