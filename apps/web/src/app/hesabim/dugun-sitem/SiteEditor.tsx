"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SiteData {
  slug: string;
  brideName: string;
  groomName: string;
  eventDate: string;
  venueText: string;
  story: string;
  published: boolean;
  rsvpCount: number;
}

export function SiteEditor({ initial }: { initial: SiteData | null }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState<string | null>(initial?.slug ?? null);
  const [published, setPublished] = useState<boolean>(initial?.published ?? false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    slug && typeof window !== "undefined" ? `${window.location.origin}/d/${slug}` : "";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      brideName: (fd.get("brideName") as string) || undefined,
      groomName: (fd.get("groomName") as string) || undefined,
      eventDate: (fd.get("eventDate") as string) || undefined,
      venueText: (fd.get("venueText") as string) || undefined,
      story: (fd.get("story") as string) || undefined,
      published: fd.get("published") === "on",
    };
    const res = await fetch("/api/wedding-site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Kaydedilemedi");
      return;
    }
    setSlug(data.slug);
    setPublished(body.published ?? false);
    setSaved(true);
    router.refresh();
  }

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Kopyalanamadı, bağlantıyı elle kopyalayın.");
    }
  }

  return (
    <div className="mt-6 space-y-6">
      {saved && (
        <div className="card p-4 bg-brand-50 border-line">
          <p className="text-sm font-medium text-brand-700">Kaydedildi ✅</p>
          {published ? (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-ink">Siteniz yayında! Bu bağlantıyı paylaşın:</p>
              <div className="flex flex-wrap items-center gap-2">
                <code className="input flex-1 min-w-[200px] truncate">{shareUrl}</code>
                <button type="button" onClick={copyLink} className="btn btn-outline">
                  {copied ? "Kopyalandı ✓" : "Kopyala"}
                </button>
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Siteyi görüntüle ↗
                </a>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">
              Site henüz yayında değil. Paylaşılabilir bağlantı almak için “Siteyi yayınla”
              seçeneğini işaretleyip tekrar kaydedin.
            </p>
          )}
        </div>
      )}

      {initial && (
        <p className="text-sm text-muted">
          Şu ana kadar <strong className="text-ink">{initial.rsvpCount}</strong> LCV yanıtı alındı.
        </p>
      )}

      <form onSubmit={onSubmit} className="card p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <L label="Gelin adı">
            <input
              name="brideName"
              defaultValue={initial?.brideName ?? ""}
              maxLength={80}
              placeholder="Örn. Ayşe"
              className="input"
            />
          </L>
          <L label="Damat adı">
            <input
              name="groomName"
              defaultValue={initial?.groomName ?? ""}
              maxLength={80}
              placeholder="Örn. Mehmet"
              className="input"
            />
          </L>
        </div>

        <L label="Düğün tarihi">
          <input
            type="date"
            name="eventDate"
            defaultValue={initial?.eventDate ?? ""}
            className="input"
          />
        </L>

        <L label="Mekan / adres">
          <input
            name="venueText"
            defaultValue={initial?.venueText ?? ""}
            maxLength={300}
            placeholder="Örn. Kayseri Kadir Has Kongre Merkezi, 19:00"
            className="input"
          />
        </L>

        <L label="Hikayeniz">
          <textarea
            name="story"
            defaultValue={initial?.story ?? ""}
            maxLength={2000}
            rows={5}
            placeholder="Tanışmanızı, nişanınızı, bu güzel günü kısaca anlatın…"
            className="input"
          />
        </L>

        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
          <input type="checkbox" name="published" defaultChecked={initial?.published ?? false} />
          Siteyi yayınla (herkese açık bağlantı oluştur)
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Kaydediliyor…" : "Kaydet"}
          </button>
          {slug && !saved && (
            <a
              href={`/d/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              Önizle ↗
            </a>
          )}
        </div>
      </form>
    </div>
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
