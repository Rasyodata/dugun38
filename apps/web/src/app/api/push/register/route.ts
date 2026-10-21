import { z } from "zod";
import { prisma } from "@dugun38/db";
import { requireRole } from "@/lib/auth";
import { parseBody, ok, handleAuthError } from "@/lib/api";

const schema = z.object({
  token: z.string().min(10).max(255).refine((t) => t.startsWith("ExponentPushToken") || t.startsWith("ExpoPushToken"), "Geçersiz push token"),
  platform: z.enum(["ios", "android"]).optional(),
});

// Mobil cihaz push token'ını kaydeder (giriş sonrası).
export async function POST(req: Request) {
  try {
    const user = await requireRole("COUPLE", "FIRM", "ADMIN");
    const { data, error } = await parseBody(req, schema);
    if (error) return error;

    // Token benzersiz: başka kullanıcıdaysa bu kullanıcıya taşı.
    await prisma.pushToken.upsert({
      where: { token: data.token },
      update: { userId: user.id, platform: data.platform ?? null },
      create: { userId: user.id, token: data.token, platform: data.platform ?? null },
    });

    return ok({ ok: true });
  } catch (e) {
    return handleAuthError(e);
  }
}
