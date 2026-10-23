import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@dugun38/db";
import { RsvpForm } from "./RsvpForm";

export const dynamic = "force-dynamic";

async function getSite(slug: string) {
  const site = await prisma.weddingSite.findUnique({ where: { slug } });
  if (!site || !site.published) return null;
  return site;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const site = await getSite(slug);
  if (!site) return { title: "Davetiye bulunamadı" };
  const bride = site.brideName || "Gelin";
  const groom = site.groomName || "Damat";
  const title = `${bride} & ${groom} Düğünü`;
  const desc = site.venueText
    ? `${bride} & ${groom} düğününe davetlisiniz. ${site.venueText}`
    : `${bride} & ${groom} düğününe davetlisiniz.`;
  return {
    title,
    description: desc,
    openGraph: { title, description: desc, type: "website" },
  };
}

const TR_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function formatDate(d: Date): string {
  return `${d.getDate()} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await getSite(slug);
  if (!site) notFound();

  const bride = site.brideName || "Gelin";
  const groom = site.groomName || "Damat";

  let dateLabel: string | null = null;
  let daysLeft: number | null = null;
  if (site.eventDate) {
    dateLabel = formatDate(site.eventDate);
    const today = new Date();
    const d0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const d1 = new Date(
      site.eventDate.getFullYear(),
      site.eventDate.getMonth(),
      site.eventDate.getDate(),
    );
    daysLeft = Math.round((d1.getTime() - d0.getTime()) / 86_400_000);
  }

  return (
    <main
      style={{
        background: "linear-gradient(135deg,#a61d48,#c62c5a,#dc4772)",
        color: "#fff",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "clamp(2rem, 6vw, 5rem) 1.5rem 4rem",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.75 }}>
          Duviora ile hazırlandı
        </p>

        <div style={{ fontSize: "2.5rem", marginTop: "1.5rem" }}>💍</div>

        <p style={{ marginTop: "1.5rem", fontSize: "0.9rem", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.85 }}>
          Evleniyoruz
        </p>

        <h1
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(2.6rem, 9vw, 4.5rem)",
            lineHeight: 1.1,
            margin: "1rem 0 0",
          }}
        >
          {bride}
          <span style={{ display: "block", fontSize: "0.5em", margin: "0.4rem 0", opacity: 0.85 }}>
            &amp;
          </span>
          {groom}
        </h1>

        {dateLabel && (
          <div style={{ marginTop: "2.5rem" }}>
            <div style={{ fontSize: "1.3rem", fontFamily: "Georgia, serif", letterSpacing: "0.05em" }}>
              {dateLabel}
            </div>
            {daysLeft !== null && daysLeft > 0 && (
              <div
                style={{
                  display: "inline-block",
                  marginTop: "1rem",
                  padding: "0.6rem 1.4rem",
                  border: "1px solid rgba(255,255,255,0.45)",
                  borderRadius: "999px",
                  fontSize: "0.95rem",
                }}
              >
                Mutlu güne <strong>{daysLeft}</strong> gün kaldı 💐
              </div>
            )}
            {daysLeft === 0 && (
              <div
                style={{
                  display: "inline-block",
                  marginTop: "1rem",
                  padding: "0.6rem 1.4rem",
                  border: "1px solid rgba(255,255,255,0.45)",
                  borderRadius: "999px",
                  fontSize: "0.95rem",
                }}
              >
                Bugün o gün! 🎉
              </div>
            )}
          </div>
        )}

        {site.venueText && (
          <div style={{ marginTop: "2.5rem" }}>
            <div style={{ fontSize: "1.3rem" }}>📍</div>
            <p style={{ marginTop: "0.5rem", fontSize: "1.1rem", opacity: 0.95, lineHeight: 1.6 }}>
              {site.venueText}
            </p>
          </div>
        )}

        {site.story && (
          <div style={{ marginTop: "3rem" }}>
            <div
              style={{
                width: 60,
                height: 1,
                background: "rgba(255,255,255,0.5)",
                margin: "0 auto 1.5rem",
              }}
            />
            <h2 style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "1.5rem", fontWeight: 400 }}>
              Hikayemiz
            </h2>
            <p
              style={{
                marginTop: "1rem",
                fontSize: "1.05rem",
                lineHeight: 1.8,
                opacity: 0.95,
                whiteSpace: "pre-wrap",
              }}
            >
              {site.story}
            </p>
          </div>
        )}

        <div style={{ marginTop: "3rem", fontSize: "1.6rem", letterSpacing: "0.5rem" }}>
          ❤
        </div>

        <div style={{ marginTop: "3rem" }}>
          <RsvpForm slug={slug} />
        </div>
      </div>
    </main>
  );
}
