import { prisma, verifyPassword } from "@dugun38/db";
import { loginSchema } from "@dugun38/core";
import { createSession, audit } from "@/lib/auth";
import { parseBody, ok, fail, clientIp } from "@/lib/api";
import { rateLimit, peekLocked } from "@/lib/rate-limit";

const MAX_FAILS = 5;
const LOCK_WINDOW = 15 * 60 * 1000;

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`login:${ip}`, 20, 15 * 60 * 1000);
  if (!rl.ok) return fail(`Çok fazla giriş denemesi. ${rl.retryAfterSec} sn sonra tekrar deneyin.`, 429);

  const { data, error } = await parseBody(req, loginSchema);
  if (error) return error;

  // Hesap kilidi: aynı e-posta için art arda başarısız denemeler
  const lockKey = `login-fail:${data.email}`;
  if (peekLocked(lockKey, MAX_FAILS)) {
    await audit("auth.login_locked", null, { email: data.email });
    return fail("Çok fazla başarısız deneme. Hesap geçici olarak kilitlendi, 15 dk sonra tekrar deneyin.", 429);
  }

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  // Zamanlama sızıntısını azaltmak için kullanıcı yoksa da doğrulama yap
  const dummyHash = "scrypt$16384$00$00";
  const valid = user && !user.deletedAt
    ? await verifyPassword(data.password, user.passwordHash)
    : (await verifyPassword(data.password, dummyHash), false);

  if (!user || !valid || user.deletedAt) {
    rateLimit(lockKey, MAX_FAILS, LOCK_WINDOW); // başarısız denemeyi say
    await audit("auth.login_failed", user?.id ?? null, { email: data.email });
    return fail("E-posta veya şifre hatalı", 401);
  }

  const token = await createSession(user.id);
  await audit("auth.login", user.id);

  return ok({ token, user: { id: user.id, role: user.role, name: user.name, email: user.email } });
}
