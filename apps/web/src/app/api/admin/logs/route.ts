import { prisma } from "@dugun38/db";
import { requireRole } from "@/lib/auth";
import { ok, handleAuthError } from "@/lib/api";

const PAGE_SIZE = 40;

// Audit/kullanıcı logları (mobil admin). ?action= & ?page=
export async function GET(req: Request) {
  try {
    await requireRole("ADMIN");
    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "";
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const where = action ? { action } : {};

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: { user: { select: { name: true, role: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return ok({
      total, page,
      logs: logs.map((l) => ({
        id: l.id, action: l.action, ip: l.ip, meta: l.meta,
        createdAt: l.createdAt,
        userName: l.user?.name ?? null, userRole: l.user?.role ?? null,
      })),
    });
  } catch (e) {
    return handleAuthError(e);
  }
}
