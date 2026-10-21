"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { formatTRY } from "@dugun38/core";

interface Msg { id: string; mine: boolean; body: string; createdAt: string }
interface ThreadData {
  id: string;
  otherParty: string;
  offerPrice: number;
  canRevealContact: boolean;
  firmPhone: string | null;
  messages: Msg[];
}

export function Conversation({ threadId }: { threadId: string }) {
  const [data, setData] = useState<ThreadData | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/threads/${threadId}`);
    if (res.ok) setData(await res.json());
  }, [threadId]);

  // İlk yük + 5 sn'de bir yenile (rapor: anlık değil, 5 sn)
  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    setError(null);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId, body }),
    });
    setSending(false);
    if (!res.ok) { setError((await res.json()).error ?? "Gönderilemedi"); return; }
    setText("");
    load();
  }

  if (!data) return <p className="text-muted">Yükleniyor…</p>;

  return (
    <div className="card flex flex-col h-[70vh]">
      {/* Başlık */}
      <div className="px-4 py-3 border-b border-line flex items-center justify-between">
        <div>
          <p className="font-semibold text-ink">{data.otherParty}</p>
          <p className="text-xs text-muted">Teklif: {formatTRY(data.offerPrice)}</p>
        </div>
        {data.canRevealContact && data.firmPhone && (
          <span className="badge bg-green-50 text-green-700">📞 {data.firmPhone}</span>
        )}
      </div>

      {/* Mesajlar */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-cream">
        {!data.canRevealContact && (
          <p className="text-[11px] text-center text-muted bg-white rounded-lg py-1.5 px-2 border border-line">
            🔒 Güvenliğiniz için telefon, e-posta ve IBAN rezervasyona kadar gizlenir.
          </p>
        )}
        {data.messages.map((m) => (
          <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${m.mine ? "bg-brand-600 text-white rounded-br-sm" : "bg-white text-ink border border-line rounded-bl-sm"}`}>
              <p className="whitespace-pre-wrap break-words">{m.body}</p>
              <p className={`text-[10px] mt-1 ${m.mine ? "text-brand-100" : "text-muted"}`}>
                {new Date(m.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        {data.messages.length === 0 && <p className="text-center text-muted text-sm">İlk mesajı siz yazın.</p>}
        <div ref={endRef} />
      </div>

      {/* Yazma */}
      <form onSubmit={send} className="p-3 border-t border-line flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input flex-1"
          placeholder="Mesaj yazın…"
          maxLength={2000}
        />
        <button type="submit" disabled={sending || !text.trim()} className="btn btn-primary disabled:opacity-60">Gönder</button>
      </form>
      {error && <p className="text-xs text-red-600 px-3 pb-2">{error}</p>}
    </div>
  );
}
