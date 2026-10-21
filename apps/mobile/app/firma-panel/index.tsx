import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { CATEGORY_BY_SLUG, DISTRICT_BY_SLUG, formatTRY, calcCommission } from "@dugun38/core";
import { api, apiBaseUrl, type FirmDashboard } from "@/api";
import { colors, radius } from "@/theme";

export default function FirmaPanelScreen() {
  const router = useRouter();
  const [data, setData] = useState<FirmDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setData(await api.firmDashboard());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  if (loading) return <ActivityIndicator color={colors.brand} style={{ marginTop: 60 }} />;
  if (!data) return <View style={styles.center}><Text style={{ color: colors.muted }}>Veri alınamadı.</Text></View>;

  if (!data.hasProfile) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 40 }}>🏢</Text>
        <Text style={styles.title}>Firma profiliniz yok</Text>
        <Text style={{ color: colors.muted, textAlign: "center", marginTop: 6 }}>
          Talep almaya başlamak için profilinizi web panelinden oluşturun. Ücretsiz.
        </Text>
        <Text style={styles.link}>{apiBaseUrl}/firma-paneli/profil</Text>
      </View>
    );
  }

  const cat = CATEGORY_BY_SLUG[data.categorySlug ?? ""];

  return (
    <ScrollView style={{ backgroundColor: colors.white }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{data.businessName}</Text>
      <Text style={{ color: colors.muted, marginTop: 2 }}>
        {cat?.icon} {cat?.name} · ★ {data.ratingAvg?.toFixed(1)} ({data.ratingCount})
      </Text>
      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>
        Hizmet bölgeleri: {(data.districts ?? []).map((d) => DISTRICT_BY_SLUG[d]?.name).join(", ")}
      </Text>

      <View style={styles.statsRow}>
        <Stat label="Açık talep" value={String(data.openRequests ?? 0)} accent />
        <Stat label="Teklif" value={String(data.offersSent ?? 0)} />
        <Stat label="Rezervasyon" value={String(data.reservations ?? 0)} />
      </View>
      <View style={[styles.card, { marginTop: 12 }]}>
        <Text style={{ color: colors.muted, fontSize: 13 }}>Net kazanç (tamamlanan)</Text>
        <Text style={{ fontSize: 24, fontWeight: "800", color: colors.ink }}>{formatTRY(data.netEarned ?? 0)}</Text>
      </View>

      <Pressable style={styles.primaryBtn} onPress={() => router.push("/firma-panel/talepler")}>
        <Text style={styles.primaryBtnText}>Gelen Talepleri Gör ({data.openRequests ?? 0})</Text>
      </Pressable>
      {data.slug && (
        <Pressable style={styles.outlineBtn} onPress={() => router.push(`/firma/${data.slug}`)}>
          <Text style={styles.outlineBtnText}>Profilimi görüntüle</Text>
        </Pressable>
      )}

      <View style={styles.infoBox}>
        <Text style={{ fontWeight: "700", color: colors.ink }}>💡 Komisyon modeli</Text>
        <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>
          Profil ücretsiz. Yalnızca rezervasyon kazandığınızda %2 komisyon. Örn. {formatTRY(300000)} rezervasyonda komisyon {formatTRY(calcCommission(300000))}.
        </Text>
      </View>
    </ScrollView>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={[styles.stat, accent && { borderColor: colors.brand, backgroundColor: colors.brandLight }]}>
      <Text style={{ fontSize: 22, fontWeight: "800", color: colors.ink }}>{value}</Text>
      <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "800", color: colors.ink },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  stat: { flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: radius, padding: 12, alignItems: "center" },
  card: { borderWidth: 1, borderColor: colors.line, borderRadius: radius, padding: 14 },
  primaryBtn: { backgroundColor: colors.brand, borderRadius: radius, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  primaryBtnText: { color: colors.white, fontWeight: "700", fontSize: 15 },
  outlineBtn: { borderWidth: 1, borderColor: colors.line, borderRadius: radius, paddingVertical: 12, alignItems: "center", marginTop: 10 },
  outlineBtnText: { color: colors.ink, fontWeight: "600" },
  infoBox: { backgroundColor: colors.brandLight, borderRadius: radius, padding: 14, marginTop: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.white, padding: 24 },
  link: { color: colors.brand, marginTop: 12, fontSize: 13 },
});
