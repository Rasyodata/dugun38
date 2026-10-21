import { prisma } from "@dugun38/db";
import { requireRole, audit, destroySession } from "@/lib/auth";
import { ok, handleAuthError } from "@/lib/api";

// KVKK: hesap silme hakkı. Soft-delete + kişisel veri anonimleştirme.
// Muhasebe/yasal yükümlülük nedeniyle rezervasyon/ödeme kayıtları saklanır ama kişiye bağı koparılır.
export async function POST() {
  try {
    const user = await requireRole("COUPLE", "FIRM");
    const anon = `silinmis+${user.id.slice(-8)}@dugun38.deleted`;

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          deletedAt: new Date(),
          name: "Silinmiş Kullanıcı",
          email: anon,
          phone: null,
          passwordHash: "scrypt$16384$deleted$deleted",
        },
      });
      await tx.session.deleteMany({ where: { userId: user.id } });
    });

    await audit("account.deleted", user.id);
    await destroySession();
    return ok({ ok: true });
  } catch (e) {
    return handleAuthError(e);
  }
}
