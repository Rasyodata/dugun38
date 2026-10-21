import { z } from "zod";
import { runAssistant } from "@/lib/assistant";
import { parseBody, ok, fail, clientIp } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  budget: z.coerce.number().positive().max(100_000_000),
  district: z.string().min(1),
  style: z.enum(["klasik", "kir", "luks", "sade"]).default("klasik"),
  guests: z.coerce.number().int().positive().max(5000).optional(),
  eventDate: z.string().optional(),
});

export async function POST(req: Request) {
  // AI çağrısı maliyetli olabilir → hız sınırı
  const rl = rateLimit(`assistant:${clientIp(req)}`, 20, 60 * 60 * 1000);
  if (!rl.ok) return fail(`Çok fazla istek. ${rl.retryAfterSec} sn sonra tekrar deneyin.`, 429);

  const { data, error } = await parseBody(req, schema);
  if (error) return error;

  const result = await runAssistant(data);
  return ok(result);
}
