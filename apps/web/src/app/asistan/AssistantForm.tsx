"use client";

import { useState } from "react";
import Link from "next/link";
import { DISTRICTS, formatTRY } from "@dugun38/core";
import { FirmCard, type FirmCardData } from "@/components/FirmCard";

const STYLES = [
  { key: "klasik", label: "Klasik salon" },
  { key: "kir", label: "Kır / doğa" },
  { key: "luks", label: "Lüks" },
  { key: "sade", label: "Sade / bütçe dostu" },
];

interface Result {
  intro: string;
  aiUsed: boolean;
  budget: { label: string; pct: number; amount: number }[];
  firms: FirmCardData[];
  timeline: { title: string; when: string }[];
}

export function AssistantForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        budget: fd.get("budget"),
        district: fd.get("district"),
        style: fd.get("style"),
        guests: fd.get("guests") || undefined,
        eventDate: fd.get("eventDate") || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Plan oluşturulamadı"); return; }
    setResult(data);
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
        <L label="Bütçeniz (₺) *">
          <input name="budget" type="number" min={1} required className="input" placeholder="örn. 350000" />
        </L>
        <L label="İlçe *">
          <select name="district" required className="input" defaultValue="melikgazi">
            {DISTRICTS.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
          </select>
        </L>
        <L label="Tarz">
          <select name="style" className="input" defaultValue="klasik">
            {STYLES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </L>
        <L label="Kişi sayısı">
          <input name="guests" type="number" min={1} className="input" placeholder="örn. 400" />
        </L>
        <L label="Düğün tarihi (opsiyonel)">
          <input name="eventDate" type="date" className="input" />
        </L>
        <div className="sm:col-span-2">
          <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-60">
            {loading ? "Planınız hazırlanıyor…" : "✨ Planımı Oluştur"}
          </button>
        </div>
      </form>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2 mt-4">{error}</p>}

      {result && (
        <div className="mt-8 space-y-8">
          {/* Karşılama */}
          <div className="card p-5 bg-brand-50 border-brand-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-brand-600 text-white">{result.aiUsed ? "✨ AI önerisi" : "📋 Akıllı planlayıcı"}</span>
            </div>
            <p className="text-ink leading-relaxed whitespace-pre-wrap">{result.intro}</p>
          </div>

          {/* Bütçe dağılımı */}
          <section>
            <h2 className="text-xl font-bold text-ink mb-3">💰 Bütçe dağılımınız</h2>
            <div className="card p-5 space-y-3">
              {result.budget.map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ink">{b.label} <span className="text-muted">%{b.pct}</span></span>
                    <span className="font-semibold text-ink">{formatTRY(b.amount)}</span>
                  </div>
                  <div className="h-2 bg-line rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.min(100, b.pct)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Firma önerileri */}
          {result.firms.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-ink mb-3">🏛️ Size özel firma önerileri</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {result.firms.map((f) => <FirmCard key={f.slug} firm={f} />)}
              </div>
            </section>
          )}

          {/* Zaman çizelgesi */}
          <section>
            <h2 className="text-xl font-bold text-ink mb-3">📅 Yapılacaklar zaman çizelgesi</h2>
            <ol className="card divide-y divide-line">
              {result.timeline.map((t, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                  <span className="flex-1 text-ink text-sm">{t.title}</span>
                  <span className="text-xs text-muted whitespace-nowrap">{t.when}</span>
                </li>
              ))}
            </ol>
          </section>

          <div className="text-center">
            <Link href="/teklif-al" className="btn btn-primary">Bu plana göre teklif al →</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-sm font-medium text-ink mb-1">{label}</span>{children}</label>;
}
