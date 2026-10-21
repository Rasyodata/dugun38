import { prisma, verifyPassword } from "@dugun38/db";
import { loginSchema } from "@dugun38/core";
import { createSession, audit } from "@/lib/auth";
import { parseBody, ok, fail, clientIp } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!rl.ok) return fail(`Çok fazla giriş denemesi. ${rl.retryAfterSec} sn sonra tekrar deneyin.`, 429);

  const { data, error } = await parseBody(req, loginSchema);
  if (error) return error;

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  // Zamanlama sızıntısını azaltmak için kullanıcı yoksa da doğrulama yap
  const dummyHash = "scrypt$16384$00$00";
  const valid = user && !user.deletedAt
    ? await verifyPassword(data.password, user.passwordHash)
    : (await verifyPassword(data.password, dummyHash), false);

  if (!user || !valid || user.deletedAt) {
    await audit("auth.login_failed", user?.id ?? null, { email: data.email });
    return fail("E-posta veya şifre hatalı", 401);
  }

  const token = await createSession(user.id);
  await audit("auth.login", user.id);

  return ok({ token, user: { id: user.id, role: user.role, name: user.name, email: user.email } });
}
