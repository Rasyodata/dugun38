import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { MessagesList } from "@/components/MessagesList";

export const metadata = { title: "Mesajlar" };

export default async function MesajlarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  if (user.role === "ADMIN") redirect("/admin");

  return (
    <div className="container-x py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-ink mb-1">Mesajlar</h1>
      <p className="text-muted text-sm mb-5">Teklif başına yazışma. İletişim bilgileri rezervasyona kadar gizlidir.</p>
      <MessagesList />
    </div>
  );
}
