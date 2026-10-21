import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { OfferRequestForm } from "./OfferRequestForm";

export const metadata = { title: "Teklif Al" };

export default async function TeklifAlPage({ searchParams }: PageProps<"/teklif-al">) {
  const user = await getCurrentUser();
  const sp = await searchParams;

  return (
    <div className="container-x py-10 max-w-2xl">
      <h1 className="text-3xl font-bold text-ink">Tek formla teklif al</h1>
      <p className="text-muted mt-2">
        Talebini bir kez gir; uygun firmalar sana fiyat göndersin. Teklifleri yan yana karşılaştır,
        beğendiğinle platform üzerinden mesajlaş. Telefon numaran rezervasyona kadar gizli kalır.
      </p>

      {user?.role === "COUPLE" ? (
        <div className="card p-6 mt-6">
          <OfferRequestForm
            defaultCategory={typeof sp.category === "string" ? sp.category : ""}
          />
        </div>
      ) : user ? (
        <div className="card p-6 mt-6 text-center">
          <p className="text-muted">Teklif talebi yalnızca çift hesaplarıyla oluşturulabilir.</p>
        </div>
      ) : (
        <div className="card p-6 mt-6 text-center">
          <p className="text-ink font-medium">Teklif almak için giriş yapın</p>
          <p className="text-muted text-sm mt-1">Çiftlere tamamen ücretsiz.</p>
          <div className="flex gap-3 justify-center mt-4">
            <Link href="/giris" className="btn btn-outline">Giriş Yap</Link>
            <Link href="/kayit" className="btn btn-primary">Üye Ol</Link>
          </div>
        </div>
      )}
    </div>
  );
}
