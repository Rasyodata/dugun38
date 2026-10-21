import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, TextInput, Alert } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { formatTRY, DEPOSIT_RELEASE_DAYS_AFTER_EVENT } from "@dugun38/core";
import { api, type ReservationDetail } from "@/api";
import { colors, radius } from "@/theme";

const STATUS_LABEL: Record<string, string> = {
  PENDING_DEPOSIT: "Kaparo bekleniyor", DEPOSIT_HELD: "Kaparo güvende (ödeme kuruluşunda)",
  COMPLETED: "Tamamlandı", DISPUTED: "İtiraz incelemede", REFUNDED: "İade edildi", CANCELLED: "İptal",
};
const STEPS = ["PENDING_DEPOSIT", "DEPOSIT_HELD", "COMPLETED"];

export default function RezervasyonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [r, setR] = useState<ReservationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [disputeMode, setDisputeMode] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [reviewMode, setReviewMode] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");

  const load = useCallback(async () => {
    try {
      setR(await api.getReservation(String(id)));
    } catch {
      setR(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function act(fn: () => Promise<unknown>, successMsg?: string) {
    setBusy(true);
    try {
      await fn();
      if (successMsg) Alert.alert("✓", successMsg);
      await load();
    } catch (e) {
      Alert.alert("Hata", e instanceof Error ? e.message : "İşlem başarısız");
    } finally {
      setBusy(false);
      setDisputeMode(false);
      setReviewMode(false);
    }
  }

  if (loading) return <ActivityIndicator color={colors.brand} style={{ marginTop: 60 }} />;
  if (!r) return <View style={styles.center}><Text style={{ color: colors.muted }}>Rezervasyon bulunamadı.</Text></View>;

  const activeIdx = STEPS.indexOf(r.status === "DISPUTED" ? "DEPOSIT_HELD" : r.status);

  return (
    <ScrollView style={{ backgroundColor: colors.white }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.firm}>{r.firmName}</Text>

      {/* Adımlar */}
      <View style={styles.steps}>
        {["Kaparo", "Güvende", "Tamamlandı"].map((label, i) => (
          <View key={label} style={styles.stepItem}>
            <View style={[styles.stepDot, i <= activeIdx && styles.stepDotActive]}>
              <Text style={{ color: i <= activeIdx ? colors.white : colors.muted, fontWeight: "700", fontSize: 12 }}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, i <= activeIdx && { color: colors.ink, fontWeight: "600" }]}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Özet */}
      <View style={styles.card}>
        <Row label="Durum" value={STATUS_LABEL[r.status] ?? r.status} />
        <Row label="Etkinlik tarihi" value={new Date(r.eventDate).toLocaleDateString("tr-TR")} />
        <Row label="Toplam tutar" value={formatTRY(r.totalAmount)} />
        <Row label="Kaparo (%20)" value={formatTRY(r.depositAmount)} />
        <Row label="Komisyon (%2)" value={formatTRY(r.commissionAmount)} muted />
        {r.deposit && <Row label="Kaparo durumu" value={r.deposit.status === "HELD" ? "Ödeme kuruluşunda" : r.deposit.status === "RELEASED" ? "Firmaya aktarıldı" : "İade edildi"} />}
        {r.firmPhone && <Row label="Firma telefonu" value={r.firmPhone} />}
      </View>

      {r.status === "DISPUTED" && (
        <View style={styles.warn}>
          <Text style={{ fontWeight: "700", color: "#92400e" }}>İtirazınız inceleniyor</Text>
          <Text style={{ color: "#92400e", marginTop: 4 }}>“{r.disputeReason}” — Admin karar verene kadar kaparo güvende tutulur.</Text>
        </View>
      )}

      {/* Aksiyonlar */}
      {r.status === "PENDING_DEPOSIT" && (
        <Pressable style={styles.primaryBtn} disabled={busy} onPress={() => act(() => api.payDeposit(r.id), "Kaparo güvende tutuluyor.")}>
          <Text style={styles.primaryBtnText}>{busy ? "…" : "%20 Kaparoyu Öde (Güvenli Kaparo · test)"}</Text>
        </Pressable>
      )}

      {r.status === "DEPOSIT_HELD" && (
        <>
          <Pressable style={styles.primaryBtn} disabled={busy} onPress={() => act(() => api.completeReservation(r.id), "Kaparo firmaya aktarıldı.")}>
            <Text style={styles.primaryBtnText}>Hizmeti aldım — kaparoyu firmaya aktar</Text>
          </Pressable>
          {!disputeMode ? (
            <Pressable style={styles.outlineBtn} onPress={() => setDisputeMode(true)}>
              <Text style={styles.outlineBtnText}>Sorun var, itiraz et</Text>
            </Pressable>
          ) : (
            <View style={{ marginTop: 10 }}>
              <TextInput style={styles.input} value={disputeReason} onChangeText={setDisputeReason} multiline placeholder="Sorunu kısaca açıklayın (admin inceleyecek)" />
              <Pressable style={styles.outlineBtn} disabled={busy} onPress={() => act(() => api.disputeReservation(r.id, disputeReason), "İtirazınız iletildi.")}>
                <Text style={styles.outlineBtnText}>İtirazı gönder</Text>
              </Pressable>
            </View>
          )}
        </>
      )}

      {r.status === "COMPLETED" && !r.hasReview && (
        !reviewMode ? (
          <Pressable style={styles.primaryBtn} onPress={() => setReviewMode(true)}>
            <Text style={styles.primaryBtnText}>Firmayı değerlendir</Text>
          </Pressable>
        ) : (
          <View style={styles.card}>
            <Text style={{ fontWeight: "600", color: colors.ink, marginBottom: 8 }}>Puan</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable key={n} onPress={() => setRating(n)}>
                  <Text style={{ fontSize: 28, color: n <= rating ? colors.gold : colors.line }}>★</Text>
                </Pressable>
              ))}
            </View>
            <TextInput style={styles.input} value={reviewBody} onChangeText={setReviewBody} multiline placeholder="Deneyiminizi paylaşın" />
            <Pressable style={styles.primaryBtn} disabled={busy} onPress={() => act(() => api.submitReview(r.id, rating, reviewBody || undefined), "Yorumunuz eklendi.")}>
              <Text style={styles.primaryBtnText}>Yorumu gönder</Text>
            </Pressable>
          </View>
        )
      )}

      <View style={styles.kaparoBox}>
        <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
          🔒 Kaparonuz lisanslı ödeme kuruluşunda (iyzico Pazaryeri) tutulur. Hizmeti aldığınızı onayladığınızda
          ya da düğünden {DEPOSIT_RELEASE_DAYS_AFTER_EVENT} gün sonra itiraz yoksa firmaya aktarılır.
          Ödeme entegrasyonu şu an test modundadır.
        </Text>
      </View>
    </ScrollView>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={{ color: colors.muted, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: muted ? colors.muted : colors.ink, fontWeight: muted ? "400" : "600", fontSize: 13 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  firm: { fontSize: 20, fontWeight: "800", color: colors.ink },
  steps: { flexDirection: "row", marginTop: 16 },
  stepItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  stepDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.line, alignItems: "center", justifyContent: "center" },
  stepDotActive: { backgroundColor: colors.brand },
  stepLabel: { fontSize: 11, color: colors.muted },
  card: { borderWidth: 1, borderColor: colors.line, borderRadius: radius, padding: 14, marginTop: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  warn: { backgroundColor: "#fef3c7", borderColor: "#fde68a", borderWidth: 1, borderRadius: radius, padding: 12, marginTop: 14 },
  primaryBtn: { backgroundColor: colors.brand, borderRadius: radius, paddingVertical: 14, alignItems: "center", marginTop: 12 },
  primaryBtnText: { color: colors.white, fontWeight: "700", fontSize: 15, textAlign: "center" },
  outlineBtn: { borderWidth: 1, borderColor: colors.line, borderRadius: radius, paddingVertical: 12, alignItems: "center", marginTop: 10 },
  outlineBtnText: { color: colors.ink, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 12, color: colors.ink, minHeight: 70, marginBottom: 10 },
  kaparoBox: { backgroundColor: colors.cream, borderRadius: radius, padding: 14, marginTop: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.white, padding: 24 },
});
