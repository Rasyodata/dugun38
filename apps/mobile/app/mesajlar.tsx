import { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { formatTRY } from "@dugun38/core";
import { api, type ThreadSummary } from "@/api";
import { colors, radius } from "@/theme";

export default function MesajlarScreen() {
  const router = useRouter();
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await api.listThreads();
      setThreads(r.threads);
    } catch {
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Odağa gelince + 10 sn'de bir yenile
  useFocusEffect(useCallback(() => {
    setLoading(true);
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]));

  if (loading) return <ActivityIndicator color={colors.brand} style={{ marginTop: 40 }} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <FlatList
        data={threads}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <Text style={{ fontSize: 36 }}>💬</Text>
            <Text style={{ color: colors.muted, marginTop: 8, textAlign: "center" }}>Henüz mesajınız yok.{"\n"}Teklif aldığınızda/verdiğinizde yazışma başlar.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => router.push(`/mesaj/${item.id}`)}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{item.otherParty.charAt(0).toUpperCase()}</Text></View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontWeight: "700", color: colors.ink }} numberOfLines={1}>{item.otherParty}</Text>
                {item.unread > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{item.unread}</Text></View>}
              </View>
              <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>
                {item.lastMessage ?? `${item.context} · ${formatTRY(item.offerPrice)}`}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.line, borderRadius: radius, padding: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.brandLight, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.brand, fontWeight: "800", fontSize: 16 },
  badge: { backgroundColor: colors.brand, borderRadius: 999, minWidth: 20, height: 20, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: "700" },
});
