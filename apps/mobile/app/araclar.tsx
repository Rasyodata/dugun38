import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { formatTRY } from "@dugun38/core";
import { api, type CoupleTools } from "@/api";
import { colors, radius } from "@/theme";

export default function AraclarScreen() {
  const [data, setData] = useState<CoupleTools | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setData(await api.coupleTools());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  async function toggle(id: string, done: boolean) {
    if (!data) return;
    setData({ ...data, agenda: data.agenda.map((a) => (a.id === id ? { ...a, done } : a)) });
    try { await api.toggleAgenda(id, done); } catch { load(); }
  }

  if (loading) return <ActivityIndicator color={colors.brand} style={{ marginTop: 60 }} />;
  if (!data) return <View style={styles.center}><Text style={{ color: colors.muted }}>Veri alınamadı.</Text></View>;

  const doneCount = data.agenda.filter((a) => a.done).length;

  return (
    <ScrollView style={{ backgroundColor: colors.white }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Ajanda */}
      <View style={styles.card}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <Text style={styles.h2}>📅 Düğün Ajandam</Text>
          <Text style={{ color: colors.muted, fontSize: 12 }}>{doneCount}/{data.agenda.length}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${data.agenda.length ? (doneCount / data.agenda.length) * 100 : 0}%` }]} />
        </View>
        {data.agenda.map((a, i) => (
          <Pressable key={a.id} style={styles.agendaRow} onPress={() => toggle(a.id, !a.done)}>
            <View style={[styles.checkbox, a.done && styles.checkboxOn]}>
              {a.done ? <Text style={{ color: colors.white, fontSize: 13 }}>✓</Text> : null}
            </View>
            <Text style={[styles.agendaText, a.done && { textDecorationLine: "line-through", color: colors.muted }]}>
              {i + 1}. {a.title}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Bütçe */}
      <View style={[styles.card, { marginTop: 16 }]}>
        <Text style={styles.h2}>💰 Bütçem</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 8 }}>
          <Text style={{ color: colors.muted }}>Planlanan: <Text style={{ color: colors.ink, fontWeight: "700" }}>{formatTRY(data.budgetTotals.planned)}</Text></Text>
          <Text style={{ color: colors.muted }}>Harcanan: <Text style={{ color: colors.ink, fontWeight: "700" }}>{formatTRY(data.budgetTotals.actual)}</Text></Text>
        </View>
        {data.budget.map((b) => (
          <View key={b.id} style={styles.budgetRow}>
            <Text style={[{ color: colors.ink }, b.paid && { textDecorationLine: "line-through", color: colors.muted }]}>{b.category}</Text>
            <Text style={{ color: colors.ink }}>{formatTRY(b.planned)}</Text>
          </View>
        ))}
        {data.budget.length === 0 && <Text style={{ color: colors.muted }}>Bütçe kalemi yok.</Text>}
      </View>

      {/* Davetli */}
      <View style={[styles.card, { marginTop: 16 }]}>
        <Text style={styles.h2}>👥 Davetli Listem</Text>
        <Text style={{ color: colors.muted, marginTop: 6 }}>
          Toplam {data.guests.total} davetli · Katılacak {data.guests.attending} kişi (LCV)
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.line, borderRadius: radius, padding: 16 },
  h2: { fontSize: 17, fontWeight: "700", color: colors.ink },
  progressTrack: { height: 8, backgroundColor: colors.line, borderRadius: 999, overflow: "hidden", marginBottom: 10 },
  progressFill: { height: "100%", backgroundColor: colors.brand },
  agendaRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.line },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  checkboxOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  agendaText: { flex: 1, color: colors.ink, fontSize: 14 },
  budgetRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: colors.line },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.white, padding: 24 },
});
