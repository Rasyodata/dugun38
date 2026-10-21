import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Conversation } from "@/components/Conversation";

export const metadata = { title: "Konuşma" };

export default async function KonusmaPage({ params }: PageProps<"/mesajlar/[id]">) {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  const { id } = await params;

  return (
    <div className="container-x py-6 max-w-2xl">
      <Link href="/mesajlar" className="text-sm text-muted hover:text-brand-700">← Mesajlar</Link>
      <div className="mt-3">
        <Conversation threadId={id} />
      </div>
    </div>
  );
}
