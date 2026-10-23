import "server-only";
import { formatTRY, DISTRICT_BY_SLUG, CATEGORY_BY_SLUG } from "@dugun38/core";
import { searchFirms } from "@/lib/firms";
import type { FirmCardData } from "@/components/FirmCard";

export interface BudgetLine {
  label: string;
  pct: number;
  amount: number;
  categorySlug?: string;
}
export interface TimelineStep {
  title: string;
  when: string;
}
export interface AssistantResult {
  intro: string;
  aiUsed: boolean;
  budget: BudgetLine[];
  firms: FirmCardData[];
  timeline: TimelineStep[];
}

export interface AssistantInput {
  budget: number;
  district: string;
  style: string; // klasik | kir | luks | sade
  guests?: number;
  eventDate?: string;
}

// Kayseri düğünü için tipik bütçe dağılımı (rapor verileriyle uyumlu).
const PLAN: { label: string; pct: number; categorySlug?: string }[] = [
  { label: "Mekan & Yemek", pct: 60, categorySlug: "dugun-salonu" },
  { label: "Gelinlik & Damatlık", pct: 9, categorySlug: "gelinlik" },
  { label: "Fotoğraf & Video", pct: 8, categorySlug: "fotograf-video" },
  { label: "Müzik & Orkestra", pct: 5, categorySlug: "muzik-orkestra" },
  { label: "Süsleme & Çiçek", pct: 4, categorySlug: "susleme-cicek" },
  { label: "Organizasyon", pct: 4, categorySlug: "organizasyon" },
  { label: "Kuaför & Makyaj", pct: 3, categorySlug: "kuafor-makyaj" },
  { label: "Takı & Alyans", pct: 3, categorySlug: "alyans" },
  { label: "Davetiye & Nikah Şekeri", pct: 2, categorySlug: "davetiye" },
  { label: "Diğer / Yedek", pct: 2 },
];

function planBudget(total: number): BudgetLine[] {
  return PLAN.map((p) => ({ ...p, amount: Math.round((total * p.pct) / 100) }));
}

function buildTimeline(eventDateIso?: string): TimelineStep[] {
  const steps = [
    { title: "Mekan & yemek firmasını kesinleştir", monthsBefore: 8 },
    { title: "Fotoğrafçı ve video ekibini ayarla", monthsBefore: 6 },
    { title: "Gelinlik & damatlık provalarına başla", monthsBefore: 5 },
    { title: "Davetiyeleri bastır ve dağıt", monthsBefore: 3 },
    { title: "Müzik / orkestra anlaşmasını yap", monthsBefore: 3 },
    { title: "Kuaför & makyaj denemesi", monthsBefore: 1 },
    { title: "Son provalar ve ödemelerin tamamlanması", monthsBefore: 0 },
  ];
  const base = eventDateIso ? new Date(eventDateIso) : null;
  return steps.map((s) => {
    if (base && !Number.isNaN(base.getTime())) {
      const d = new Date(base);
      d.setMonth(d.getMonth() - s.monthsBefore);
      return { title: s.title, when: d.toLocaleDateString("tr-TR", { month: "long", year: "numeric" }) };
    }
    return { title: s.title, when: s.monthsBefore ? `Düğünden ${s.monthsBefore} ay önce` : "Düğün ayı" };
  });
}

async function recommendFirms(input: AssistantInput): Promise<FirmCardData[]> {
  const venueCat = input.style === "kir" ? "kir-dugunu" : "dugun-salonu";
  const sort = input.style === "luks" ? "rating" : input.style === "sade" ? "price_asc" : "relevance";
  const cats = [venueCat, "fotograf-video", "gelinlik", "muzik-orkestra"];
  const results: FirmCardData[] = [];
  for (const cat of cats) {
    const { firms } = await searchFirms({ category: cat, district: input.district, sort: sort as never, pageSize: 1 });
    if (firms[0]) results.push(firms[0]);
  }
  return results;
}

/** Kişisel karşılama metni — ANTHROPIC_API_KEY varsa Claude, yoksa şablon. */
async function generateIntro(input: AssistantInput, budget: BudgetLine[]): Promise<{ text: string; aiUsed: boolean }> {
  const distName = DISTRICT_BY_SLUG[input.district]?.name ?? "Kayseri";
  const styleName = { klasik: "klasik", kir: "kır / doğa", luks: "lüks", sade: "sade ve bütçe dostu" }[input.style] ?? "klasik";
  const venueBudget = budget[0]?.amount ?? 0;

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic();
      const msg = await client.messages.create({
        model: "claude-opus-4-8",
        max_tokens: 500,
        thinking: { type: "adaptive" },
        output_config: { effort: "low" },
        system:
          "Sen Duviora'in sıcak, samimi AI düğün asistanısın. Kayseri'de düğün planlayan çiftlere kısa (2-3 cümle), içten, Türkçe bir karşılama ve tek bir pratik ipucu yaz. Abartma, gerçekçi ol. Emoji kullanabilirsin ama az.",
        messages: [
          {
            role: "user",
            content: `${distName}'de ${styleName} tarzda, ${formatTRY(input.budget)} bütçeli bir düğün planlıyoruz${input.guests ? `, ${input.guests} kişi` : ""}. Mekan+yemek için ~${formatTRY(venueBudget)} ayırmayı düşünüyoruz. Bize kısa bir karşılama ve bu bütçe/ilçe için 1 pratik ipucu ver.`,
          },
        ],
      });
      const text = msg.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("\n").trim();
      if (text) return { text, aiUsed: true };
    } catch (e) {
      console.error("[assistant] Claude çağrısı başarısız, şablona düşülüyor:", e);
    }
  }

  // Kural tabanlı yedek (API anahtarı yoksa)
  const tip =
    input.style === "sade"
      ? "Hafta içi veya sezon dışı tarihler mekan fiyatlarını belirgin düşürür."
      : input.style === "luks"
        ? "Vitrin/öne çıkan firmalarla erken anlaşmak takvim garantisi sağlar."
        : input.style === "kir"
          ? "Erciyes manzaralı bahçelerde akşam serinliği için ısıtıcı/örtü planlayın."
          : "Mekan+yemek bütçenin ~%60'ıdır; önce onu kesinleştirin, gerisi kolaylaşır.";
  return {
    text: `${distName}'de ${styleName} düğününüz için hazırız 💐 ${formatTRY(input.budget)} bütçeyle güzel bir plan çıkar. İpucu: ${tip}`,
    aiUsed: false,
  };
}

export async function runAssistant(input: AssistantInput): Promise<AssistantResult> {
  const budget = planBudget(input.budget);
  const [firms, intro] = await Promise.all([recommendFirms(input), generateIntro(input, budget)]);
  return {
    intro: intro.text,
    aiUsed: intro.aiUsed,
    budget,
    firms,
    timeline: buildTimeline(input.eventDate),
  };
}

export const ASSISTANT_STYLES = [
  { key: "klasik", label: "Klasik salon" },
  { key: "kir", label: "Kır / doğa" },
  { key: "luks", label: "Lüks" },
  { key: "sade", label: "Sade / bütçe dostu" },
] as const;

export { CATEGORY_BY_SLUG };
