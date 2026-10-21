import { useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CATEGORIES, DISTRICTS } from "@dugun38/core";
import { api } from "@/api";
import { useAuth } from "@/auth";
import { colors, radius } from "@/theme";

export default function TeklifScreen() {
  const { category: presetCat } = useLocalSearchParams<{ category?: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [category, setCategory] = useState<string>(presetCat ?? "");
  const [district, setDistrict] = useState<string>("");
  const [guests, setGuests] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [budget, setBudget] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 40 }}>📨</Text>
        <Text style={styles.loginTitle}>Teklif almak için giriş yapın</Text>
        <Text style={{ color: colors.muted, textAlign: "center", marginTop: 6 }}>Çiftlere tamamen ücretsiz.</Text>
        <Pressable style={styles.primaryBtn} onPress={() => router.push("/giris")}>
          <Text style={styles.primaryBtnText}>Giriş Yap</Text>
        </Pressable>
      </View>
    );
  }

  async function submit() {
    if (!category || !district || !eventDate) {
      Alert.alert("Eksik bilgi", "Kategori, ilçe ve tarih zorunlu.");
      return;
    }
    setLoading(true);
    try {
      const r = await api.createOfferRequest({
        category, district,
        guests: guests ? Number(guests) : undefined,
        eventDate,
        budget: budget ? Number(budget) : undefined,
        note: note || undefined,
      });
      Alert.alert("Talebiniz alındı!", `${r.matchedCount} uygun firmaya iletildi. Teklifler geldikçe bilgilendirileceksiniz.`);
      setGuests(""); setBudget(""); setNote("");
    } catch (e) {
      Alert.alert("Hata", e instanceof Error ? e.message : "Gönderilemedi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={{ backgroundColor: colors.white }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.h1}>Tek formla teklif al</Text>
      <Text style={{ color: colors.muted, marginTop: 4 }}>Uygun firmalar size fiyat göndersin. Telefonunuz rezervasyona kadar gizli.</Text>

      <Label>Kategori *</Label>
      <ChipRow items={CATEGORIES.map((c) => ({ value: c.slug, label: `${c.icon} ${c.name}` }))} selected={category} onSelect={setCategory} />

      <Label>İlçe *</Label>
      <ChipRow items={DISTRICTS.map((d) => ({ value: d.slug, label: d.name }))} selected={district} onSelect={setDistrict} />

      <Label>Kişi sayısı</Label>
      <TextInput style={styles.input} value={guests} onChangeText={setGuests} keyboardType="numeric" placeholder="örn. 400" />

      <Label>Düğün / etkinlik tarihi * (YYYY-AA-GG)</Label>
      <TextInput style={styles.input} value={eventDate} onChangeText={setEventDate} placeholder="2026-08-15" />

      <Label>Bütçe (₺)</Label>
      <TextInput style={styles.input} value={budget} onChangeText={setBudget} keyboardType="numeric" placeholder="örn. 350000" />

      <Label>Not</Label>
      <TextInput style={[styles.input, { height: 90 }]} value={note} onChangeText={setNote} multiline placeholder="Firmalara iletmek istedikleriniz" />

      <Pressable style={[styles.primaryBtn, { marginTop: 20 }]} onPress={submit} disabled={loading}>
        <Text style={styles.primaryBtnText}>{loading ? "Gönderiliyor…" : "Teklif Talebini Gönder"}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Label({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}
function ChipRow({ items, selected, onSelect }: { items: { value: string; label: string }[]; selected: string; onSelect: (v: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {items.map((it) => (
        <Pressable key={it.value} onPress={() => onSelect(it.value)} style={[styles.chip, selected === it.value && styles.chipActive]}>
          <Text style={[styles.chipText, selected === it.value && { color: colors.white }]}>{it.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 22, fontWeight: "800", color: colors.ink },
  label: { fontWeight: "600", color: colors.ink, marginTop: 16, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 12, color: colors.ink },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { fontSize: 13, color: colors.ink },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.white, padding: 24 },
  loginTitle: { fontSize: 18, fontWeight: "700", color: colors.ink, marginTop: 12 },
  primaryBtn: { backgroundColor: colors.brand, borderRadius: radius, paddingVertical: 14, alignItems: "center", paddingHorizontal: 32, marginTop: 16 },
  primaryBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
});
