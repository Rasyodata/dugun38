import { redirect } from "next/navigation";
import { prisma } from "@dugun38/db";
import { formatTRY } from "@dugun38/core";
import { getCurrentUser } from "@/lib/auth";
import { AgendaChecklist } from "@/components/AgendaChecklist";

export const metadata = { title: "Düğün Araçlarım" };

export default async function AraclarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  if (user.role !== "COUPLE") redirect("/");

  const [agenda, budget, guests] = await Promise.all([
    prisma.agendaItem.findMany({ where: { coupleId: user.id }, orderBy: { sort: "asc" } }),
    prisma.budgetItem.findMany({ where: { coupleId: user.id } }),
    prisma.guest.findMany({ where: { coupleId: user.id } }),
  ]);

  const totalPlanned = budget.reduce((s, b) => s + b.planned, 0);
  const totalActual = budget.reduce((s, b) => s + b.actual, 0);
  const rsvpYes = guests.filter((g) => g.rsvp === "YES").reduce((s, g) => s + g.seats, 0);

  return (
    <div className="container-x py-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-ink">Düğün Araçlarım 🛠️</h1>
      <p className="text-muted text-sm mt-1">Kayseri'ye özel ajanda, bütçe planı ve davetli listesi.</p>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {/* Ajanda */}
        <section className="card p-5">
          <h2 className="font-bold text-ink mb-3">📅 Düğün Ajandam (Kayseri şablonu)</h2>
          {agenda.length ? (
            <AgendaChecklist items={agenda.map((a) => ({ id: a.id, title: a.title, done: a.done }))} />
          ) : (
            <p className="text-sm text-muted">Ajanda boş.</p>
          )}
        </section>

        <div className="space-y-6">
          {/* Bütçe */}
          <section className="card p-5">
            <h2 className="font-bold text-ink mb-3">💰 Bütçem</h2>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-muted">Planlanan: <strong className="text-ink">{formatTRY(totalPlanned)}</strong></span>
              <span className="text-muted">Harcanan: <strong className="text-ink">{formatTRY(totalActual)}</strong></span>
            </div>
            <ul className="space-y-1.5">
              {budget.map((b) => (
                <li key={b.id} className="flex items-center justify-between text-sm py-1.5 border-b border-line last:border-0">
                  <span className={b.paid ? "text-muted line-through" : "text-ink"}>{b.category}</span>
                  <span className="text-ink">{formatTRY(b.planned)}</span>
                </li>
              ))}
              {budget.length === 0 && <p className="text-sm text-muted">Bütçe kalemi yok.</p>}
            </ul>
          </section>

          {/* Davetli */}
          <section className="card p-5">
            <h2 className="font-bold text-ink mb-2">👥 Davetli Listem</h2>
            <p className="text-sm text-muted">
              Toplam {guests.length} davetli · Katılacak {rsvpYes} kişi (LCV).
            </p>
            <p className="text-xs text-muted mt-2">WhatsApp ile davet gönderme ve oturma planı bir sonraki fazda eklenecek.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
