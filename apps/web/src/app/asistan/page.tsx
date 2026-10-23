import { AssistantForm } from "./AssistantForm";

export const metadata = {
  title: "Duviora AI",
  description: "Bütçe, ilçe ve tarzınıza göre Kayseri'ye özel düğün planı: bütçe dağılımı, firma önerileri ve zaman çizelgesi.",
};

export default function AsistanPage() {
  return (
    <div className="container-x py-10 max-w-3xl">
      <div className="text-center">
        <span className="badge bg-brand-600 text-white">✨ Duviora AI</span>
        <h1 className="text-3xl md:text-4xl font-bold text-ink mt-4">Düğününüzü birlikte planlayalım</h1>
        <p className="text-muted mt-3 max-w-xl mx-auto">
          Bütçenizi, ilçenizi ve tarzınızı söyleyin; size özel bütçe dağılımı, gerçek Kayseri firmalarından öneriler
          ve adım adım bir zaman çizelgesi hazırlayalım.
        </p>
      </div>
      <div className="card p-6 mt-8">
        <AssistantForm />
      </div>
    </div>
  );
}
