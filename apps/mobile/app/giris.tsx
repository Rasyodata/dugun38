import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/auth";
import { colors, radius } from "@/theme";

const DEMO_ROLES: { role: "COUPLE" | "FIRM" | "ADMIN"; label: string; icon: string }[] = [
  { role: "COUPLE", label: "Çift", icon: "👰" },
  { role: "FIRM", label: "Firma", icon: "🏢" },
  { role: "ADMIN", label: "Yönetici", icon: "🛡️" },
];

export default function GirisScreen() {
  const { login, demoLogin, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("cift@dugun38.local");
  const [password, setPassword] = useState("cift1234");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    try {
      await login(email.trim(), password);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Giriş başarısız");
    }
  }

  async function demo(role: "COUPLE" | "FIRM" | "ADMIN") {
    setError(null);
    try {
      const u = await demoLogin(role);
      if (u.role === "FIRM") router.replace("/firma-panel");
      else router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Demo giriş kapalı");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.white, padding: 20 }}>
      <Text style={styles.h1}>Giriş yap</Text>

      {/* Demo — şifresiz tek tıkla */}
      <Text style={styles.demoLabel}>Demo — şifresiz tek tıkla gir</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {DEMO_ROLES.map((r) => (
          <Pressable key={r.role} style={styles.demoBtn} disabled={loading} onPress={() => demo(r.role)}>
            <Text style={{ fontSize: 24 }}>{r.icon}</Text>
            <Text style={styles.demoBtnText}>{r.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.divider}><Text style={styles.dividerText}>veya e-posta ile</Text></View>

      <Text style={styles.label}>E-posta</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

      <Text style={styles.label}>Şifre</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.primaryBtn} onPress={submit} disabled={loading}>
        <Text style={styles.primaryBtnText}>{loading ? "Giriş yapılıyor…" : "Giriş Yap"}</Text>
      </Pressable>

      <View style={styles.demo}>
        <Text style={{ color: colors.muted, fontSize: 12 }}>Demo: cift@dugun38.local / cift1234</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: "800", color: colors.ink, marginBottom: 12 },
  demoLabel: { fontSize: 12, color: colors.muted, marginBottom: 8, fontWeight: "600" },
  demoBtn: { flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: radius, paddingVertical: 14, alignItems: "center", backgroundColor: colors.brandLight },
  demoBtnText: { fontSize: 12, fontWeight: "700", color: colors.ink, marginTop: 4 },
  divider: { alignItems: "center", marginVertical: 16 },
  dividerText: { color: colors.muted, fontSize: 12 },
  label: { fontWeight: "600", color: colors.ink, marginTop: 14, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 12, color: colors.ink },
  error: { color: "#c0152f", marginTop: 12 },
  primaryBtn: { backgroundColor: colors.brand, borderRadius: radius, paddingVertical: 14, alignItems: "center", marginTop: 22 },
  primaryBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  demo: { backgroundColor: colors.cream, borderRadius: 8, padding: 12, marginTop: 20 },
});
