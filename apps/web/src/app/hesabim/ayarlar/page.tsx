import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";

export const metadata = { title: "Hesap Ayarları" };

export default async function AyarlarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  return (
    <div className="container-x py-8 max-w-xl">
      <h1 className="text-2xl font-bold text-ink">Hesap ayarları</h1>

      <div className="card p-5 mt-6">
        <h2 className="font-semibold text-ink">Hesap bilgileri</h2>
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Ad</dt><dd className="text-ink">{user.name}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">E-posta</dt><dd className="text-ink">{user.email}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Hesap türü</dt><dd className="text-ink">{user.role === "COUPLE" ? "Çift" : user.role === "FIRM" ? "Firma" : "Yönetici"}</dd></div>
        </dl>
      </div>

      <div className="card p-5 mt-5">
        <h2 className="font-semibold text-ink">KVKK ve veri haklarınız</h2>
        <p className="text-sm text-muted mt-2">
          Kişisel verilerinizin nasıl işlendiğini <Link href="/kvkk" className="text-brand-700 hover:underline">KVKK Aydınlatma Metni</Link>'nde bulabilirsiniz.
          Dilediğiniz zaman hesabınızı silebilirsiniz.
        </p>
        <div className="mt-4">
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  );
}
