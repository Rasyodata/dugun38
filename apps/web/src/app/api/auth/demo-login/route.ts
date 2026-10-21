import { prisma } from "@dugun38/db";
import { createSession, audit } from "@/lib/auth";
import { parseBody, ok, fail } from "@/lib/api";
import { z } from "zod";

// DEMO/SUNUM amaçlı şifresiz giriş. SADECE ALLOW_DEMO_LOGIN=1 iken çalışır.
// Üretimde bu env ayarlanmaz → endpoint devre dışı kalır (güvenli).
const DEMO_EMAILS: Record<string, string> = {
  COUPLE: "cift@dugun38.local",
  FIRM: "firma1@dugun38.local",
  ADMIN: "admin@dugun38.local",
};

export async function POST(req: Request) {
  if (process.env.ALLOW_DEMO_LOGIN !== "1") return fail("Demo giriş kapalı", 403);

  const { data, error } = await parseBody(req, z.object({ role: z.enum(["COUPLE", "FIRM", "ADMIN"]) }));
  if (error) return error;

  const email = DEMO_EMAILS[data.role]!;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return fail("Demo hesabı bulunamadı (seed çalıştırın)", 404);

  const token = await createSession(user.id);
  await audit("auth.demo_login", user.id, { role: data.role });
  return ok({ token, user: { id: user.id, role: user.role, name: user.name, email: user.email } });
}
