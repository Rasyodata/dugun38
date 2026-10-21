"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatTRY } from "@dugun38/core";

interface ThreadItem {
  id: string;
  otherParty: string;
  context: string;
  offerPrice: number;
  hasReservation: boolean;
  unread: number;
  lastMessage: string | null;
  lastAt: string;
}

export function MessagesList() {
  const [threads, setThreads] = useState<ThreadItem[] | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const res = await fetch("/api/threads");
      if (res.ok && active) setThreads((await res.json()).threads);
    };
    load();
    const t = setInterval(load, 10000);
    return () => { active = false; clearInterval(t); };
  }, []);

  if (threads === null) return <p className="text-muted">Yükleniyor…</p>;
  if (threads.length === 0)
    return (
      <div className="card p-10 text-center">
        <p className="text-muted">Henüz mesajınız yok.</p>
        <p className="text-sm text-muted mt-1">Bir teklif aldığınızda/verdiğinizde yazışma başlar.</p>
      </div>
    );

  return (
    <div className="space-y-2">
      {threads.map((t) => (
        <Link key={t.id} href={`/mesajlar/${t.id}`} className="card p-4 flex items-center gap-3 hover:border-brand-400">
          <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold shrink-0">
            {t.otherParty.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-ink truncate">{t.otherParty}</span>
              {t.unread > 0 && <span className="badge bg-brand-600 text-white shrink-0">{t.unread}</span>}
            </div>
            <p className="text-xs text-muted truncate">{t.lastMessage ?? `${t.context} · ${formatTRY(t.offerPrice)}`}</p>
          </div>
          {t.hasReservation && <span className="badge bg-green-50 text-green-700 shrink-0">rezerve</span>}
        </Link>
      ))}
    </div>
  );
}
