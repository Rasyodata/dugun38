import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/auth";
import { apiBaseUrl } from "@/api";
import { colors, radius } from "@/theme";

const ROLE_LABEL = { COUPLE: "Çift", FIRM: "Firma", ADMIN: "Yönetici" } as const;

export default function HesabimScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.white, padding: 20 }}>
      {user ? (
        <>
          <View style={styles.avatar}><Text style={{ fontSize: 28, color: colors.brand, fontWeight: "800" }}>{user.name.charAt(0)}</Text></View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={{ color: colors.muted, textAlign: "center" }}>{user.email}</Text>
          <Text style={styles.roleBadge}>{ROLE_LABEL[user.role]} hesabı</Text>

          {user.role === "FIRM" ? (
            <>
              <Pressable style={styles.row} onPress={() => router.push("/firma-panel")}><Text style={styles.rowText}>🏢 Firma Paneli</Text></Pressable>
              <Pressable style={styles.row} onPress={() => router.push("/firma-panel/talepler")}><Text style={styles.rowText}>📋 Gelen Talepler</Text></Pressable>
              <Pressable style={styles.row} onPress={() => router.push("/")}><Text style={styles.rowText}>🔍 Rakipleri incele</Text></Pressable>
            </>
          ) : (
            <>
              <Pressable style={styles.row} onPress={() => router.push("/teklif")}><Text style={styles.rowText}>📨 Teklif Al</Text></Pressable>
              <Pressable style={styles.row} onPress={() => router.push("/")}><Text style={styles.rowText}>🔍 Firma Ara</Text></Pressable>
            </>
          )}

          <Pressable style={[styles.row, { marginTop: 24 }]} onPress={logout}>
            <Text style={[styles.rowText, { color: colors.brand }]}>Çıkış Yap</Text>
          </Pressable>
        </>
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 44 }}>👰🤵</Text>
          <Text style={styles.name}>Düğün38'e hoş geldiniz</Text>
          <Text style={{ color: colors.muted, textAlign: "center", marginTop: 6 }}>
            Giriş yapın; teklif alın, favorilerinizi ve düğün planınızı yönetin.
          </Text>
          <Pressable style={styles.primaryBtn} onPress={() => router.push("/giris")}>
            <Text style={styles.primaryBtnText}>Giriş Yap</Text>
          </Pressable>
        </View>
      )}
      <Text style={styles.footer}>Backend: {apiBaseUrl}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.brandLight, alignItems: "center", justifyContent: "center", alignSelf: "center", marginTop: 20 },
  name: { fontSize: 20, fontWeight: "800", color: colors.ink, textAlign: "center", marginTop: 12 },
  roleBadge: { alignSelf: "center", marginTop: 10, color: colors.brand, backgroundColor: colors.brandLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, fontWeight: "600", fontSize: 12, overflow: "hidden" },
  row: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  rowText: { fontSize: 16, color: colors.ink },
  primaryBtn: { backgroundColor: colors.brand, borderRadius: radius, paddingVertical: 14, alignItems: "center", paddingHorizontal: 40, marginTop: 20 },
  primaryBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  footer: { color: colors.muted, fontSize: 11, textAlign: "center", marginTop: 10 },
});
