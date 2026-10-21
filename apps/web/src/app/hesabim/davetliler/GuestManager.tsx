"use client";

import { useEffect, useState } from "react";

type Rsvp = "PENDING" | "YES" | "NO" | "MAYBE";

interface Guest {
  id: string;
  name: string;
  phone: string | null;
  side: string | null;
  rsvp: Rsvp;
  seats: number;
}

interface Stats {
  total: number;
  attending: number;
  pending: number;
  declined: number;
}

const RSVP_LABEL: Record<Rsvp, string> = {
  PENDING: "Bekliyor",
  YES: "Katılacak",
  NO: "Gelmeyecek",
  MAYBE: "Belki",
};

const RSVP_BADGE: Record<Rsvp, string> = {
  YES: "bg-green-100 text-green-700",
  NO: "bg-red-100 text-red-700",
  MAYBE: "bg-yellow-100 text-yellow-700",
  PENDING: "bg-gray-100 text-gray-600",
};

const RSVP_OPTIONS: Rsvp[] = ["PENDING", "YES", "MAYBE", "NO"];

function waLink(phone: string, name: string) {
  const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
  const number = digits.startsWith("90") ? digits : `90${digits}`;
  const text = `Merhaba ${name}, düğünümüze davetlisiniz! 💍 Lütfen katılım durumunuzu bildirin. — Düğün38`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function GuestManager() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, attending: 0, pending: 0, declined: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function load() {
    const res = await fetch("/api/guests");
    const data = await res.json();
    if (res.ok) {
      setGuests(data.guests);
      setStats(data.stats);
    } else {
      setError(data.error ?? "Davetliler yüklenemedi");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body = {
      name: fd.get("name"),
      phone: fd.get("phone") || undefined,
      side: fd.get("side") || undefined,
      seats: fd.get("seats") || 1,
    };
    setAdding(true);
    const res = await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok) {
      setError(data.error ?? "Davetli eklenemedi");
      return;
    }
    form.reset();
    await load();
  }

  async function onChangeRsvp(id: string, rsvp: Rsvp) {
    const res = await fetch(`/api/guests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rsvp }),
    });
    if (res.ok) await load();
    else setError("Güncellenemedi");
  }

  async function onDelete(id: string) {
    const res = await fetch(`/api/guests/${id}`, { method: "DELETE" });
    if (res.ok) await load();
    else setError("Silinemedi");
  }

  return (
    <div className="mt-6 space-y-6">
      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Toplam davetli" value={stats.total} />
        <Stat label="Katılacak (kişi)" value={stats.attending} />
        <Stat label="Bekleyen" value={stats.pending} />
        <Stat label="Gelmeyecek" value={stats.declined} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Ekleme formu */}
      <form onSubmit={onAdd} className="card p-4 bg-brand-50">
        <h2 className="font-semibold text-ink mb-3">Davetli ekle</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input name="name" required maxLength={80} placeholder="Ad Soyad *" className="input" />
          <input name="phone" placeholder="Telefon (05xx...)" className="input" />
          <select name="side" className="input" defaultValue="">
            <option value="">Taraf (seçimsiz)</option>
            <option value="gelin">Gelin tarafı</option>
            <option value="damat">Damat tarafı</option>
          </select>
          <input
            name="seats"
            type="number"
            min={1}
            max={20}
            defaultValue={1}
            placeholder="Kişi sayısı"
            className="input"
          />
        </div>
        <button type="submit" disabled={adding} className="btn btn-primary mt-3">
          {adding ? "Ekleniyor..." : "Ekle"}
        </button>
      </form>

      {/* Liste */}
      {loading ? (
        <p className="text-muted text-sm">Yükleniyor...</p>
      ) : guests.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-muted">Henüz davetli eklemediniz. Yukarıdaki formla ilk davetlinizi ekleyin. 💐</p>
        </div>
      ) : (
        <div className="space-y-2">
          {guests.map((g) => (
            <div key={g.id} className="card p-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[140px]">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink">{g.name}</span>
                  {g.side && (
                    <span className="badge bg-cream text-brand-700 text-xs">
                      {g.side === "gelin" ? "Gelin" : "Damat"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted mt-0.5">
                  {g.seats} kişi{g.phone ? ` · ${g.phone}` : ""}
                </p>
              </div>

              <span className={`badge text-xs ${RSVP_BADGE[g.rsvp]}`}>{RSVP_LABEL[g.rsvp]}</span>

              <select
                value={g.rsvp}
                onChange={(e) => onChangeRsvp(g.id, e.target.value as Rsvp)}
                className="input w-auto text-sm py-1"
                aria-label="Katılım durumu"
              >
                {RSVP_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {RSVP_LABEL[r]}
                  </option>
                ))}
              </select>

              {g.phone && (
                <a
                  href={waLink(g.phone, g.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline text-sm"
                >
                  WhatsApp davet
                </a>
              )}

              <button onClick={() => onDelete(g.id)} className="btn btn-outline text-sm text-red-600">
                Sil
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4 bg-brand-50">
      <div className="text-2xl font-bold text-ink">{value}</div>
      <div className="text-xs text-muted mt-1">{label}</div>
    </div>
  );
}
