import "server-only";
import { prisma } from "@dugun38/db";

// Expo Push API ile mobil bildirim gönderimi. "Fire-and-forget" — istekleri bloklamaz.
const EXPO_URL = "https://exp.host/--/api/v2/push/send";

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export async function sendPush(userIds: string[], payload: PushPayload): Promise<void> {
  try {
    const ids = [...new Set(userIds)].filter(Boolean);
    if (ids.length === 0) return;

    const tokens = await prisma.pushToken.findMany({
      where: { userId: { in: ids } },
      select: { token: true },
    });
    if (tokens.length === 0) return;

    const messages = tokens.map((t) => ({
      to: t.token,
      sound: "default",
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
    }));

    // Expo bir istekte en fazla 100 mesaj kabul eder
    for (let i = 0; i < messages.length; i += 100) {
      const batch = messages.slice(i, i + 100);
      await fetch(EXPO_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(batch),
      }).catch(() => {});
    }
  } catch (e) {
    console.error("[push] gönderim hatası:", e);
  }
}
