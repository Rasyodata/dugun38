import { NextResponse, type NextRequest } from "next/server";

// CSRF koruması: cookie tabanlı mutasyonlarda tarayıcının Sec-Fetch-Site başlığını
// kontrol eder. "cross-site" (başka siteden tetiklenen) istekleri reddeder.
// Bearer token kullanan istemciler (mobil) CSRF'e açık olmadığı için muaftır.
// Sec-Fetch-Site proxy'den bağımsızdır → cloudflared/Render arkasında da güvenli çalışır.

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function middleware(req: NextRequest) {
  if (MUTATING.has(req.method)) {
    const hasBearer = req.headers.get("authorization")?.startsWith("Bearer ");
    const secFetchSite = req.headers.get("sec-fetch-site");
    if (!hasBearer && secFetchSite === "cross-site") {
      return NextResponse.json(
        { error: "Güvenlik: siteler arası istek reddedildi (CSRF)." },
        { status: 403 },
      );
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
