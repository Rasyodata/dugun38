import { useState, useCallback } from "react";
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { useFocusEffect } from "expo-router";
import { DISTRICT_BY_SLUG, formatTRY, calcCommission } from "@dugun38/core";
import { api, type FirmRequestItem } from "@/api";
import { colors, radius } from "@/theme";

export default function FirmTaleplerScreen() {
  const [requests, setRequests] = useState<FirmRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await api.firmRequests();
      setRequests(r.requests);
    } catch {
      // sessiz
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  async function send(reqId: string) {
    const price = Number(prices[reqId]);
    if (!price || price <= 0) { Alert.alert("Geçersiz", "Geçerli bir tutar girin."); return; }
    setBusy(reqId);
    try {
      await api.sendOffer(reqId, price);
      Alert.alert("✓", "Teklifiniz gönderildi.");
      await load();
    } catch (e) {
      Alert.alert("Hata", e instanceof Error ? e.message : "Gönderilemedi");
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <ActivityIndicator color={colors.brand} style={{ marginTop: 40 }} />;

  return (
    <ScrollView
      style={{ backgroundColor: colors.white }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.brand} />}
    >
      {requests.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ color: colors.muted, textAlign: "center" }}>Şu an açık talep yok.{"\n"}Yeni talep geldiğinde SMS ile bilgilendirilirsiniz.</Text>
        </View>
      ) : (
        requests.map((r) => {
          const price = Number(prices[r.id]) || 0;
          return (
            <View key={r.id} style={styles.card}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontWeight: "700", color: colors.ink }}>
                  {DISTRICT_BY_SLUG[r.districtSlug]?.name} · {r.guests ? `${r.guests} kişi` : "kişi belirtilmemiş"}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{new Date(r.eventDate).toLocaleDateString("tr-TR")}</Text>
              </View>
              <Text style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>
                {r.budget ? `Bütçe: ${formatTRY(r.budget)}` : "Bütçe belirtilmemiş"}
              </Text>
              {r.note ? <Text style={styles.note}>“{r.note}”</Text> : null}

              {r.myOffer ? (
                <Text style={{ color: colors.green, marginTop: 8, fontWeight: "600" }}>
                  ✓ Teklifiniz: {formatTRY(r.myOffer.price)} ({r.myOffer.status})
                </Text>
              ) : null}

              <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder={r.myOffer ? "Yeni tutar (₺)" : "Teklif tutarı (₺)"}
                  value={prices[r.id] ?? ""}
                  onChangeText={(t) => setPrices((p) => ({ ...p, [r.id]: t }))}
                />
                <Pressable style={styles.btn} disabled={busy === r.id} onPress={() => send(r.id)}>
                  <Text style={styles.btnText}>{busy === r.id ? "…" : r.myOffer ? "Güncelle" : "Teklif ver"}</Text>
                </Pressable>
              </View>
              {price > 0 && (
                <Text style={{ color: colors.muted, fontSize: 11, marginTop: 6 }}>
                  Rezervasyon olursa komisyon {formatTRY(calcCommission(price))} (%2) · Net {formatTRY(price - calcCommission(price))}
                </Text>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.line, borderRadius: radius, padding: 14, marginBottom: 12 },
  note: { color: colors.ink, backgroundColor: colors.cream, borderRadius: 8, padding: 8, marginTop: 8, fontSize: 13 },
  input: { flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 10, color: colors.ink },
  btn: { backgroundColor: colors.brand, borderRadius: 8, paddingHorizontal: 18, justifyContent: "center" },
  btnText: { color: colors.white, fontWeight: "700" },
  empty: { alignItems: "center", padding: 30 },
});
