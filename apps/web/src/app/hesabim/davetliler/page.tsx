import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { GuestManager } from "./GuestManager";

export const metadata = {
  title: "Davetli Listem",
  description: "Düğün davetlilerinizi ekleyin, LCV durumlarını takip edin ve WhatsApp ile davet gönderin.",
};

export default async function DavetlilerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  if (user.role !== "COUPLE") redirect("/");

  return (
    <div className="container-x py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-ink">Davetli Listem 👥</h1>
      <p className="text-muted text-sm mt-1">
        Davetlilerinizi ekleyin, katılım (LCV) durumlarını takip edin ve tek tıkla WhatsApp daveti gönderin.
      </p>
      <GuestManager />
    </div>
  );
}
