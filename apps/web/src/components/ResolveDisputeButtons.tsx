"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ResolveDisputeButtons({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function resolve(decision: "release" | "refund") {
    setLoading(true);
    await fetch(`/api/admin/disputes/${id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2 mt-3">
      <button onClick={() => resolve("release")} disabled={loading} className="btn btn-primary text-sm disabled:opacity-60">Firmaya aktar</button>
      <button onClick={() => resolve("refund")} disabled={loading} className="btn btn-outline text-sm disabled:opacity-60">Çifte iade et</button>
    </div>
  );
}
