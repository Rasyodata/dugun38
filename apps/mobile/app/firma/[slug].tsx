import { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, ActivityIndicator, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { CATEGORY_BY_SLUG, DISTRICT_BY_SLUG, formatTRY } from "@dugun38/core";
import { api, type FirmDetail } from "@/api";
import { colors, radius } from "@/theme";

export default function FirmScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [firm, setFirm] = useState<FirmDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFirm(String(slug)).then(setFirm).catch(() => setFirm(null)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <ActivityIndicator color={colors.brand} style={{ marginTop: 60 }} />;
  if (!firm) return <View style={styles.center}><Text style={{ color: colors.muted, marginTop: 60 }}>Firma bulunamadı.</Text></View>;

  const cat = CATEGORY_BY_SLUG[firm.categorySlug];
  const img = api.mediaUrl(firm.media[0]?.url ?? null);

  return (
    <>
      <Stack.Screen options={{ title: firm.businessName }} />
      <ScrollView style={{ backgroundColor: colors.white }} contentContainerStyle={{ paddingBottom: 100 }}>
        {img ? <Image source={{ uri: img }} style={styles.hero} /> : <View style={[styles.hero, styles.center]}><Text style={{ fontSize: 56 }}>{cat?.icon}</Text></View>}

        <View style={{ padding: 16 }}>
          <Text style={styles.title}>{firm.businessName}</Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
            <Text style={styles.rating}>★ {firm.ratingAvg.toFixed(1)} ({firm.ratingCount})</Text>
            <Text style={{ color: colors.muted }}>{cat?.name}</Text>
            {firm.verified && <Text style={styles.verified}>✓ Doğrulanmış</Text>}
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {firm.districts.map((d) => (
              <Text key={d} style={styles.districtChip}>📍 {DISTRICT_BY_SLUG[d]?.name}</Text>
            ))}
          </View>

          {firm.about ? <Text style={styles.about}>{firm.about}</Text> : null}

          {firm.packages.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Paketler</Text>
              {firm.packages.map((p, i) => (
                <View key={i} style={styles.pkg}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "700", color: colors.ink }}>{p.name}</Text>
                    {p.description ? <Text style={{ color: colors.muted, fontSize: 12 }}>{p.description}</Text> : null}
                  </View>
                  <Text style={{ fontWeight: "700", color: colors.brand }}>{formatTRY(p.price)}</Text>
                </View>
              ))}
            </>
          )}

          <Text style={styles.sectionTitle}>Yorumlar</Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>
            Yalnızca rezervasyon yapıp hizmet alan çiftler yorum yazabilir.
          </Text>
          {firm.reviews.length === 0 ? (
            <Text style={{ color: colors.muted }}>Henüz yorum yok.</Text>
          ) : (
            firm.reviews.map((r, i) => (
              <View key={i} style={styles.review}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontWeight: "600", color: colors.ink }}>{r.name}</Text>
                  <Text style={{ color: colors.gold }}>{"★".repeat(r.rating)}</Text>
                </View>
                {r.body ? <Text style={{ color: colors.muted, marginTop: 4 }}>{r.body}</Text> : null}
              </View>
            ))
          )}

          <View style={styles.kaparoBox}>
            <Text style={{ fontWeight: "700", color: colors.ink }}>🔒 Güvenli Kaparo</Text>
            <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>
              Kaparonuz lisanslı ödeme kuruluşunda bekler; hizmeti aldıktan sonra firmaya geçer.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.cta}>
        <Pressable style={styles.ctaBtn} onPress={() => router.push({ pathname: "/teklif", params: { category: firm.categorySlug } })}>
          <Text style={{ color: colors.white, fontWeight: "700", fontSize: 16 }}>Bu firmadan teklif al</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { width: "100%", height: 220, backgroundColor: colors.brandLight },
  title: { fontSize: 22, fontWeight: "800", color: colors.ink },
  rating: { color: colors.brand, fontWeight: "700" },
  verified: { color: colors.green, fontSize: 12, fontWeight: "600" },
  districtChip: { fontSize: 12, color: colors.muted, borderWidth: 1, borderColor: colors.line, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  about: { color: colors.muted, marginTop: 14, lineHeight: 21 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: colors.ink, marginTop: 20, marginBottom: 8 },
  pkg: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.line, borderRadius: radius, padding: 12, marginBottom: 8 },
  review: { borderWidth: 1, borderColor: colors.line, borderRadius: radius, padding: 12, marginBottom: 8 },
  kaparoBox: { backgroundColor: colors.brandLight, borderRadius: radius, padding: 14, marginTop: 20 },
  cta: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 14, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line },
  ctaBtn: { backgroundColor: colors.brand, borderRadius: radius, paddingVertical: 14, alignItems: "center" },
  center: { alignItems: "center", justifyContent: "center" },
});
