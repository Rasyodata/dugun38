import { prisma, hashPassword } from "@dugun38/db";
import { registerSchema } from "@dugun38/core";
import { createSession, audit } from "@/lib/auth";
import { parseBody, ok, fail, clientIp } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = rateLimit(`register:${clientIp(req)}`, 5, 60 * 60 * 1000);
  if (!rl.ok) return fail(`Çok fazla deneme. ${rl.retryAfterSec} sn sonra tekrar deneyin.`, 429);

  const { data, error } = await parseBody(req, registerSchema);
  if (error) return error;

  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) return fail("Bu e-posta zaten kayıtlı", 409);

  const user = await prisma.user.create({
    data: {
      role: data.role,
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash: await hashPassword(data.password),
      kvkkAcceptedAt: new Date(),
    },
  });

  const token = await createSession(user.id);
  await audit("auth.register", user.id, { role: data.role });

  return ok({ token, user: { id: user.id, role: user.role, name: user.name, email: user.email } }, 201);
}
