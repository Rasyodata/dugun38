import { prisma } from "@dugun38/db";
import { requireRole } from "@/lib/auth";
import { ok, handleAuthError } from "@/lib/api";

// Çift araçları: ajanda + bütçe + davetli özeti (mobil).
export async function GET() {
  try {
    const user = await requireRole("COUPLE");
    const [agenda, budget, guests] = await Promise.all([
      prisma.agendaItem.findMany({ where: { coupleId: user.id }, orderBy: { sort: "asc" } }),
      prisma.budgetItem.findMany({ where: { coupleId: user.id } }),
      prisma.guest.findMany({ where: { coupleId: user.id }, select: { rsvp: true, seats: true } }),
    ]);
    return ok({
      agenda: agenda.map((a) => ({ id: a.id, title: a.title, done: a.done })),
      budget: budget.map((b) => ({ id: b.id, category: b.category, planned: b.planned, actual: b.actual, paid: b.paid })),
      budgetTotals: {
        planned: budget.reduce((s, b) => s + b.planned, 0),
        actual: budget.reduce((s, b) => s + b.actual, 0),
      },
      guests: {
        total: guests.length,
        attending: guests.filter((g) => g.rsvp === "YES").reduce((s, g) => s + g.seats, 0),
      },
    });
  } catch (e) {
    return handleAuthError(e);
  }
}
