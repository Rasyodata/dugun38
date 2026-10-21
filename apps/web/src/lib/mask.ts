import "server-only";

// Rezervasyon öncesi mesajlarda iletişim bilgisi sızıntısını engeller
// (rapor: "rezervasyona kadar telefon, e-posta ve IBAN gizli").
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const IBAN = /TR\d{2}[\s]?(?:\d[\s]?){22}/gi;
// 10+ haneli (boşluk/tire/parantez ile ayrılmış) telefon benzeri diziler
const PHONE = /(?:\+?\d[\s().-]?){10,}/g;

export function maskContact(text: string): string {
  return text
    .replace(EMAIL, "•••@•••")
    .replace(IBAN, "•••• (IBAN gizli)")
    .replace(PHONE, "•••••• (gizli)");
}
