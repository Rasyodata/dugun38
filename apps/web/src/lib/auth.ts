import "server-only";
import { cookies, headers } from "next/headers";
import { randomBytes } from "node:crypto";
import { prisma } from "@dugun38/db";
import type { Role } from "@dugun38/core";

export const SESSION_COOKIE = "d38_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün

export interface SessionUser {
  id: string;
  role: Role;
  name: string;
  email: string;
}

function newToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Oturum oluştur + httpOnly cookie yaz. Mobil için token'ı da döndürür. */
export async function createSession(userId: string): Promise<string> {
  const token = newToken();
  const h = await headers();
  await prisma.session.create({
    data: {
      id: token,
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: h.get("user-agent")?.slice(0, 300) ?? null,
    },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    // HTTPS'te güvenli; http LAN/preview için INSECURE_COOKIES=1 ile geçici kapatılabilir.
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return token;
}

/** Geçerli kullanıcıyı döndür (yoksa null). Cookie veya Authorization: Bearer ile. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  let token = jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    // Mobil/API istemcileri için Bearer token
    const h = await headers();
    const auth = h.get("authorization");
    if (auth?.startsWith("Bearer ")) token = auth.slice(7).trim();
  }
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { id: token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date() || session.user.deletedAt) {
    return null;
  }
  const u = session.user;
  return { id: u.id, role: u.role as Role, name: u.name, email: u.email };
}

/** Oturumu kapat. */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { id: token } });
    jar.delete(SESSION_COOKIE);
  }
}

/** Belirli rolleri zorunlu kıl (API/sunucu eyleminde). Yetkisizse hata fırlatır. */
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError(401, "Giriş yapmalısınız");
  if (roles.length && !roles.includes(user.role)) {
    throw new AuthError(403, "Bu işlem için yetkiniz yok");
  }
  return user;
}

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Audit kaydı — güvenlik/uyum için önemli eylemleri loglar. */
export async function audit(
  action: string,
  userId: string | null,
  meta?: Record<string, unknown>,
): Promise<void> {
  const h = await headers();
  await prisma.auditLog.create({
    data: {
      action,
      userId,
      meta: meta ? JSON.stringify(meta) : null,
      ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    },
  });
}
