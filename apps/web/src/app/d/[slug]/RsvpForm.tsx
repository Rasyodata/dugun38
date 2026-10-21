"use client";

import { useState } from "react";

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.3)",
  borderRadius: "1rem",
  padding: "1.75rem",
  textAlign: "left",
  backdropFilter: "blur(4px)",
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.85rem",
  borderRadius: "0.6rem",
  border: "1px solid rgba(255,255,255,0.4)",
  background: "rgba(255,255,255,0.95)",
  color: "#4a0d22",
  fontSize: "1rem",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.85rem",
  marginBottom: "0.35rem",
  opacity: 0.95,
};

export function RsvpForm({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [attending, setAttending] = useState(true);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      slug,
      name: (fd.get("name") as string) || "",
      attending,
      guests: (fd.get("guests") as string) || "1",
      note: (fd.get("note") as string) || undefined,
    };
    const res = await fetch("/api/wedding-site/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Yanıt gönderilemedi. Lütfen tekrar deneyin.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div style={cardStyle}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem" }}>💐</div>
          <h3 style={{ fontSize: "1.3rem", marginTop: "0.75rem", fontFamily: "Georgia, serif" }}>
            Teşekkür ederiz!
          </h3>
          <p style={{ marginTop: "0.5rem", opacity: 0.95, lineHeight: 1.6 }}>
            {attending
              ? "Katılımınızı aldık. Sizi o güzel günde aramızda görmek için sabırsızlanıyoruz."
              : "Yanıtınız için teşekkür ederiz. Sizi özleyeceğiz!"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={cardStyle}>
      <h3 style={{ fontSize: "1.3rem", fontFamily: "Georgia, serif", marginBottom: "1.25rem", textAlign: "center" }}>
        Lütfen Cevap Veriniz (LCV)
      </h3>

      <div style={{ marginBottom: "1rem" }}>
        <label style={labelStyle} htmlFor="rsvp-name">Adınız Soyadınız</label>
        <input id="rsvp-name" name="name" required maxLength={80} style={fieldStyle} placeholder="Adınız" />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <span style={labelStyle}>Katılacak mısınız?</span>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={() => setAttending(true)}
            style={{
              flex: 1,
              padding: "0.6rem",
              borderRadius: "0.6rem",
              border: "1px solid rgba(255,255,255,0.5)",
              background: attending ? "#fff" : "transparent",
              color: attending ? "#a61d48" : "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Evet, geliyorum 🎉
          </button>
          <button
            type="button"
            onClick={() => setAttending(false)}
            style={{
              flex: 1,
              padding: "0.6rem",
              borderRadius: "0.6rem",
              border: "1px solid rgba(255,255,255,0.5)",
              background: !attending ? "#fff" : "transparent",
              color: !attending ? "#a61d48" : "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Maalesef gelemiyorum
          </button>
        </div>
      </div>

      {attending && (
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle} htmlFor="rsvp-guests">Kaç kişi geleceksiniz?</label>
          <input
            id="rsvp-guests"
            name="guests"
            type="number"
            min={1}
            max={20}
            defaultValue={1}
            style={fieldStyle}
          />
        </div>
      )}

      <div style={{ marginBottom: "1.25rem" }}>
        <label style={labelStyle} htmlFor="rsvp-note">Notunuz (isteğe bağlı)</label>
        <textarea
          id="rsvp-note"
          name="note"
          maxLength={500}
          rows={3}
          style={{ ...fieldStyle, resize: "vertical" }}
          placeholder="Çifte iletmek istediğiniz dilekler…"
        />
      </div>

      {error && (
        <p style={{ color: "#ffe0e6", fontSize: "0.9rem", marginBottom: "0.75rem" }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "0.8rem",
          borderRadius: "0.6rem",
          border: "none",
          background: "#fff",
          color: "#a61d48",
          fontWeight: 700,
          fontSize: "1rem",
          cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Gönderiliyor…" : "Yanıtımı Gönder"}
      </button>
    </form>
  );
}
