"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const COOKIE = "d38_cookie_consent";

function setConsent(value: "all" | "essential") {
  // 6 ay geçerli
  document.cookie = `${COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`;
}

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const has = document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE}=`));
    if (!has) setShow(true);
  }, []);

  if (!show) return null;

  function choose(v: "all" | "essential") {
    setConsent(v);
    setShow(false);
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4">
      <div className="container-x">
        <div className="card shadow-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center gap-4 bg-white">
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink">🍪 Çerez kullanımı</p>
            <p className="text-sm text-muted mt-1">
              Düğün38, oturumunuzu açık tutmak için zorunlu çerezler ve deneyimi geliştirmek için tercih/analitik
              çerezleri kullanır. Ayrıntılar için{" "}
              <Link href="/cerez" className="text-brand-700 hover:underline">Çerez Politikası</Link>.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => choose("essential")} className="btn btn-outline text-sm">Yalnızca zorunlu</button>
            <button onClick={() => choose("all")} className="btn btn-primary text-sm">Tümünü kabul et</button>
          </div>
        </div>
      </div>
    </div>
  );
}
