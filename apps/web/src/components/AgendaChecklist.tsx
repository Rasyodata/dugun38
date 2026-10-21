"use client";

import { useState } from "react";

interface Item { id: string; title: string; done: boolean }

export function AgendaChecklist({ items }: { items: Item[] }) {
  const [state, setState] = useState(items);

  async function toggle(id: string, done: boolean) {
    setState((s) => s.map((i) => (i.id === id ? { ...i, done } : i)));
    await fetch("/api/agenda/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done }),
    });
  }

  const doneCount = state.filter((i) => i.done).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted">{doneCount}/{state.length} tamamlandı</span>
        <div className="w-32 h-2 bg-line rounded-full overflow-hidden">
          <div className="h-full bg-brand-600" style={{ width: `${state.length ? (doneCount / state.length) * 100 : 0}%` }} />
        </div>
      </div>
      <ul className="space-y-1">
        {state.map((i, idx) => (
          <li key={i.id} className="flex items-start gap-3 py-2 border-b border-line last:border-0">
            <input type="checkbox" checked={i.done} onChange={(e) => toggle(i.id, e.target.checked)} className="mt-1" />
            <span className={`text-sm ${i.done ? "line-through text-muted" : "text-ink"}`}>
              <span className="text-muted mr-1">{idx + 1}.</span>{i.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
