"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FavoriteButton({ firmId, canFavorite }: { firmId: string; canFavorite: boolean }) {
  const router = useRouter();
  const [fav, setFav] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!canFavorite) {
      router.push("/giris");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firmId }),
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setFav(data.favorited);
    }
  }

  return (
    <button onClick={toggle} disabled={loading} className="btn btn-outline text-sm" aria-pressed={fav}>
      {fav ? "❤️ Favorilerde" : "🤍 Favori"}
    </button>
  );
}
