import "server-only";

// SMS / bildirim soyutlaması. Test modunda konsola yazar.
// Faz 2'de gerçek sağlayıcı (ör. NetGSM / İleti Merkezi) buraya entegre edilir.
// Rakip analizi raporu: "SMS test modunda".

export interface NotifyTarget {
  id: string;
  businessName: string;
  publicPhone: string | null;
}

export async function notifyFirmsOfRequest(firms: NotifyTarget[], requestId: string): Promise<void> {
  for (const f of firms) {
    await sendSms(
      f.publicPhone,
      `Duviora: Yeni bir teklif talebiniz var. Panelden görüntüleyip teklif verin. (Talep #${requestId.slice(-6)})`,
    );
  }
}

export async function sendSms(phone: string | null, message: string): Promise<void> {
  // TODO(Faz 2): gerçek SMS sağlayıcısına gönder.
  console.log(`[SMS:test] → ${phone ?? "(telefon yok)"}: ${message}`);
}
