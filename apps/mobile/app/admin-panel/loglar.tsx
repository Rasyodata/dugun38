import { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { api, type AdminLog } from "@/api";
import { colors } from "@/theme";

const ACTION_LABELS: Record<string, string> = {
  "auth.register": "Kayıt", "auth.login": "Giriş", "auth.login_failed": "Başarısız giriş",
  "auth.login_locked": "Hesap kilidi", "auth.demo_login": "Demo giriş",
  "offer_request.create": "Teklif talebi", "offer.create": "Teklif verme", "offer.accept": "Teklif kabul",
  "reservation.deposit_held": "Kaparo ödendi", "reservation.completed": "Rezervasyon tamam",
  "reservation.disputed": "İtiraz", "review.create": "Yorum", "firm.profile_save": "Firma profil",
  "admin.dispute_resolved": "İtiraz kararı", "account.deleted": "Hesap silme",
  "admin.firm_verify": "Firma doğrulama", "admin.firm_showcase": "Vitrin",
};

export default function AdminLoglarScreen() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const r = await api.adminLogs(p);
      setLogs(r.logs);
      setTotal(r.total);
      setPage(r.page);
    } catch {
      // sessiz
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(1); }, [load]));

  const pages = Math.ceil(total / 40);

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      {loading ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(l) => l.id}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={<Text style={{ color: colors.muted, marginBottom: 8 }}>{total} kayıt · sayfa {page}/{pages || 1}</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={styles.action}>{ACTION_LABELS[item.action] ?? item.action}</Text>
                <Text style={styles.time}>{new Date(item.createdAt).toLocaleString("tr-TR")}</Text>
              </View>
              <Text style={styles.user}>
                {item.userName ? `${item.userName} (${item.userRole})` : "sistem"}{item.ip ? ` · ${item.ip}` : ""}
              </Text>
            </View>
          )}
          ListFooterComponent={
            pages > 1 ? (
              <View style={styles.pager}>
                <Pressable disabled={page <= 1} onPress={() => load(page - 1)} style={[styles.pageBtn, page <= 1 && { opacity: 0.4 }]}>
                  <Text style={styles.pageBtnText}>← Önceki</Text>
                </Pressable>
                <Pressable disabled={page >= pages} onPress={() => load(page + 1)} style={[styles.pageBtn, page >= pages && { opacity: 0.4 }]}>
                  <Text style={styles.pageBtnText}>Sonraki →</Text>
                </Pressable>
              </View>
            ) : undefined
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { borderBottomWidth: 1, borderBottomColor: colors.line, paddingVertical: 10 },
  action: { fontWeight: "700", color: colors.brand, fontSize: 13 },
  time: { fontSize: 11, color: colors.muted },
  user: { fontSize: 12, color: colors.ink, marginTop: 3 },
  pager: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  pageBtn: { borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18 },
  pageBtnText: { color: colors.ink, fontWeight: "600" },
});
