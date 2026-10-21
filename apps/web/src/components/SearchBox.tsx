"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, DISTRICTS } from "@dugun38/core";

export function SearchBox({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");
  const [guests, setGuests] = useState("");
  const [date, setDate] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (district) params.set("district", district);
    if (guests) params.set("guests", guests);
    if (date) params.set("date", date);
    router.push(`/arama?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className={`card ${compact ? "p-3" : "p-4 shadow-xl"} grid gap-3 md:grid-cols-[1.4fr_1fr_0.8fr_1fr_auto] items-end`}
    >
      <Field label="Ne arıyorsun?">
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Tüm kategoriler</option>
          <optgroup label="Mekanlar">
            {CATEGORIES.filter((c) => c.kind === "VENUE").map((c) => (
              <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
            ))}
          </optgroup>
          <optgroup label="Hizmetler">
            {CATEGORIES.filter((c) => c.kind === "SERVICE").map((c) => (
              <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
            ))}
          </optgroup>
        </select>
      </Field>
      <Field label="Hangi ilçe?">
        <select className="input" value={district} onChange={(e) => setDistrict(e.target.value)}>
          <option value="">Tüm Kayseri</option>
          {DISTRICTS.map((d) => (
            <option key={d.slug} value={d.slug}>{d.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Kaç kişi?">
        <input className="input" type="number" min={1} placeholder="örn. 400" value={guests} onChange={(e) => setGuests(e.target.value)} />
      </Field>
      <Field label="Hangi tarih?">
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <button type="submit" className="btn btn-primary h-[46px] md:w-auto w-full">
        🔍 Ara
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted mb-1">{label}</span>
      {children}
    </label>
  );
}
