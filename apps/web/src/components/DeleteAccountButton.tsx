"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteAccountButton() {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function del() {
    setLoading(true);
    await fetch("/api/account/delete", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (!confirm) {
    return (
      <button onClick={() => setConfirm(true)} className="btn btn-outline text-sm text-red-600 border-red-200">
        Hesabımı sil (KVKK)
      </button>
    );
  }
  return (
    <div className="card p-4 border-red-200 bg-red-50">
      <p className="text-sm text-ink font-medium">Hesabınızı silmek istediğinize emin misiniz?</p>
      <p className="text-xs text-muted mt-1">
        Kişisel verileriniz anonimleştirilir. Yasal yükümlülük gereği geçmiş rezervasyon kayıtları kişiye bağı koparılarak saklanır. Bu işlem geri alınamaz.
      </p>
      <div className="flex gap-2 mt-3">
        <button onClick={del} disabled={loading} className="btn bg-red-600 text-white text-sm disabled:opacity-60">
          {loading ? "Siliniyor…" : "Evet, sil"}
        </button>
        <button onClick={() => setConfirm(false)} className="btn btn-outline text-sm">Vazgeç</button>
      </div>
    </div>
  );
}
