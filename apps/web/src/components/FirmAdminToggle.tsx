"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FirmAdminToggle({ id, field, initial, label }: { id: string; field: "verified" | "showcase"; initial: boolean; label: string }) {
  const router = useRouter();
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const next = !on;
    const res = await fetch(`/api/admin/firms/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: next }),
    });
    setBusy(false);
    if (res.ok) { setOn(next); router.refresh(); }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`badge ${on ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"} disabled:opacity-60`}
    >
      {on ? "✓" : "○"} {label}
    </button>
  );
}
