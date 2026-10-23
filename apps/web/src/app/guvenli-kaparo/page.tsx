import Link from "next/link";

export const metadata = { title: "Güvenli Kaparo Nedir?" };

const steps = [
  {
    icon: "🤝",
    title: "Teklifi kabul et",
    desc: "Firmalardan gelen teklifleri karşılaştırın ve beğendiğiniz teklifi platform üzerinden kabul edin.",
  },
  {
    icon: "🔒",
    title: "%20 kaparoyu öde",
    desc: "Toplam tutarın %20'si lisanslı ödeme kuruluşunda (iyzico Pazaryeri) bloke edilir. Para firmaya değil, güvenli hesapta bekler.",
  },
  {
    icon: "🎉",
    title: "Hizmeti al",
    desc: "Düğün günü yaklaşır, firma taahhüt ettiği hizmeti sunar. Her şey yolunda giderse adım 4'e geçilir.",
  },
  {
    icon: "✅",
    title: "Kaparo firmaya geçer",
    desc: "Hizmeti onayladığınızda ya da düğünden 3 gün sonra itiraz olmazsa kaparo firmaya aktarılır. İtiraz hâlinde admin karar verir.",
  },
];

export default function GuvenliKaparoPage() {
  return (
    <div className="container-x py-10">
      <div className="max-w-3xl">
        <span className="badge bg-brand-50 text-brand-700 mb-4">Duviora&apos;e özel</span>
        <h1 className="text-3xl font-bold text-ink">Güvenli Kaparo Nedir?</h1>
        <p className="text-muted leading-relaxed mt-2">
          Güvenli Kaparo, ödediğiniz kaparonun hizmeti alana kadar lisanslı bir ödeme
          kuruluşunda güvenle bekletildiği, hem çifti hem firmayı koruyan bir sistemdir.
          Kayseri&apos;de düğün planlarken paranız boşa gitmez.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-8">
        {steps.map((s, i) => (
          <div key={s.title} className="card p-6 relative">
            <div className="badge bg-brand-100 text-brand-700 absolute top-4 right-4">{i + 1}</div>
            <div className="text-3xl">{s.icon}</div>
            <div className="font-bold text-ink mt-3">{s.title}</div>
            <p className="text-muted leading-relaxed mt-2 text-sm">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="max-w-3xl">
        <h2 className="text-xl font-bold text-ink mt-8 mb-2">Neden güvenli?</h2>
        <ul className="list-disc pl-6 text-muted leading-relaxed mt-2 space-y-1">
          <li>Kaparo doğrudan firmaya değil, <strong className="text-ink">lisanslı ödeme kuruluşuna</strong> (iyzico Pazaryeri) gider ve orada bloke edilir.</li>
          <li>Firma hizmeti sunmazsa para firmaya geçmez; itiraz süreci başlar.</li>
          <li>Düğünden sonra 3 gün itiraz süreniz vardır; bu süre içinde sorun bildirmezseniz ödeme otomatik tamamlanır.</li>
          <li>İtiraz hâlinde tarafsız admin, belgeleri inceleyerek karar verir.</li>
          <li>Çiftlerden hiçbir ücret veya komisyon alınmaz; kaparo toplam hizmet tutarının bir parçasıdır.</li>
        </ul>

        <div className="card p-6 mt-6 bg-cream">
          <p className="text-muted leading-relaxed text-sm">
            Not: iyzico entegrasyonu test modundadır; yayından önce 6493 sayılı kanun
            açısından teyit edilecektir.
          </p>
        </div>

        <div className="card p-6 mt-6 border-brand-200 bg-brand-50">
          <h2 className="text-xl font-bold text-ink mb-2">Düğün.com&apos;da bu yok</h2>
          <p className="text-muted leading-relaxed mt-2">
            Diğer platformlar yalnızca sizi firmayla buluşturur; ödeme ve kaparo güvenliği
            tamamen sizin riskinizdedir. Duviora, <strong className="text-ink">Güvenli
            Kaparo</strong> ile paranızı hizmeti alana kadar koruyan Kayseri&apos;deki tek
            platformdur.
          </p>
        </div>

        <div className="mt-8">
          <Link href="/teklif-al" className="btn btn-primary">Hemen teklif al</Link>
        </div>
      </div>
    </div>
  );
}
