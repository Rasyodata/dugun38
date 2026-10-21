import { redirect } from "next/navigation";
import { prisma } from "@dugun38/db";
import { getCurrentUser } from "@/lib/auth";
import { SiteEditor } from "./SiteEditor";

export const metadata = {
  title: "Düğün Web Sitem",
  description: "Çiftlere özel, paylaşılabilir düğün davetiye web sitenizi oluşturun ve yayınlayın.",
};

export default async function DugunSitemPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  if (user.role !== "COUPLE") redirect("/");

  const site = await prisma.weddingSite.findUnique({
    where: { coupleId: user.id },
    include: { _count: { select: { rsvps: true } } },
  });

  const initial = site
    ? {
        slug: site.slug,
        brideName: site.brideName ?? "",
        groomName: site.groomName ?? "",
        eventDate: site.eventDate ? site.eventDate.toISOString().slice(0, 10) : "",
        venueText: site.venueText ?? "",
        story: site.story ?? "",
        published: site.published,
        rsvpCount: site._count.rsvps,
      }
    : null;

  return (
    <div className="container-x py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-ink">Düğün Web Sitem 💒</h1>
      <p className="text-muted text-sm mt-1">
        Gelin &amp; damat adlarınız, düğün tarihiniz ve hikayenizle güzel bir davetiye sayfası
        oluşturun. Yayınlayınca benzersiz bir bağlantı ile herkesle paylaşabilir, LCV
        yanıtlarını toplayabilirsiniz.
      </p>
      <SiteEditor initial={initial} />
    </div>
  );
}
