import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError } from "./auth";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || "local";
}

/** Gövdeyi JSON olarak oku ve zod ile doğrula. Hata durumunda yapılandırılmış döner. */
export async function parseBody<S extends z.ZodTypeAny>(
  req: Request,
  schema: S,
): Promise<{ data: z.infer<S>; error: null } | { data: null; error: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { data: null, error: fail("Geçersiz istek gövdesi", 400) };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      data: null,
      error: fail(first?.message ?? "Doğrulama hatası", 422, {
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      }),
    };
  }
  return { data: parsed.data, error: null };
}

/** AuthError'ı uygun HTTP yanıtına çevirir. */
export function handleAuthError(e: unknown): NextResponse {
  if (e instanceof AuthError) return fail(e.message, e.status);
  console.error("[api] beklenmeyen hata:", e);
  return fail("Sunucu hatası", 500);
}
