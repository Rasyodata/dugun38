import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { formatTRY } from "@dugun38/core";
import { api, type AdminOverview } from "@/api";
import { colors, radius } from "@/theme";

export default function AdminPanelScreen() {
  const router = useRouter();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await api.adminOverview());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  function resolve(id: string, decision: "release" | "refund") {
    const label = decision === "release" ? "firmaya aktar" : "çifte iade et";
    Alert.alert("İtiraz kararı", `Kaparoyu ${label}?`, [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Onayla", onPress: async () => {
          setBusy(id);
          try {
            await api.resolveDispute(id, decision);
            await load();
          } catch (e) {
            Alert.alert("Hata", e instanceof Error ? e.message : "Başarısız");
          } finally {
            setBusy(null);
          }
        },
      },
    ]);
  }

  if (loading) return <ActivityIndicator color={colors.brand} style={{ marginTop: 60 }} />;
  if (!data) return <View style={styles.center}><Text style={{ color: colors.muted }}>Veri alınamadı (yetki?).</Text></View>;

  return (
    <ScrollView
      style={{ backgroundColor: colors.white }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.brand} />}
    >
      <View style={styles.grid}>
        <Stat label="Kullanıcı" value={String(data.users)} />
        <Stat label="Firma" value={String(data.firms)} />
        <Stat label="Talep" value={String(data.requests)} />
        <Stat label="Rezervasyon" value={String(data.reservations)} />
        <Stat label="İşlem hacmi" value={formatTRY(data.gmv)} wide />
        <Stat label="Komisyon geliri" value={formatTRY(data.commission)} wide accent />
      </View>

      <Pressable style={styles.linkBtn} onPress={() => router.push("/admin-panel/loglar")}>
        <Text style={styles.linkBtnText}>📜 Kullanıcı Loglarını Gör</Text>
      </Pressable>

      <Text style={styles.h2}>Bekleyen itirazlar ({data.disputes.length})</Text>
      {data.disputes.length === 0 ? (
        <Text style={{ color: colors.muted }}>Bekleyen itiraz yok. 🎉</Text>
      ) : (
        data.disputes.map((d) => (
          <View key={d.id} style={styles.dispute}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontWeight: "700", color: colors.ink, flex: 1 }}>{d.coupleName} ↔ {d.firmName}</Text>
              <Text style={{ fontWeight: "700", color: colors.ink }}>{formatTRY(d.depositAmount)}</Text>
            </View>
            {d.reason ? <Text style={{ color: "#92400e", marginTop: 4 }}>“{d.reason}”</Text> : null}
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <Pressable style={styles.primaryBtn} disabled={busy === d.id} onPress={() => resolve(d.id, "release")}>
                <Text style={styles.primaryBtnText}>Firmaya aktar</Text>
              </Pressable>
              <Pressable style={styles.outlineBtn} disabled={busy === d.id} onPress={() => resolve(d.id, "refund")}>
                <Text style={styles.outlineBtnText}>Çifte iade</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function Stat({ label, value, wide, accent }: { label: string; value: string; wide?: boolean; accent?: boolean }) {
  return (
    <View style={[styles.stat, wide && { width: "100%" }, accent && { borderColor: colors.brand, backgroundColor: colors.brandLight }]}>
      <Text style={{ fontSize: 20, fontWeight: "800", color: colors.ink }}>{value}</Text>
      <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  stat: { width: "47%", borderWidth: 1, borderColor: colors.line, borderRadius: radius, padding: 12 },
  linkBtn: { borderWidth: 1, borderColor: colors.line, borderRadius: radius, padding: 14, alignItems: "center", marginTop: 14 },
  linkBtnText: { color: colors.ink, fontWeight: "700" },
  h2: { fontSize: 17, fontWeight: "700", color: colors.ink, marginTop: 22, marginBottom: 10 },
  dispute: { borderWidth: 1, borderColor: "#fde68a", backgroundColor: "#fef3c7", borderRadius: radius, padding: 14, marginBottom: 10 },
  primaryBtn: { flex: 1, backgroundColor: colors.brand, borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  primaryBtnText: { color: colors.white, fontWeight: "700", fontSize: 13 },
  outlineBtn: { flex: 1, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  outlineBtnText: { color: colors.ink, fontWeight: "600", fontSize: 13 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.white, padding: 24 },
});
