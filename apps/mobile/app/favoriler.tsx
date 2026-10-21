import { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, Image, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { CATEGORY_BY_SLUG, DISTRICT_BY_SLUG, formatTRY } from "@dugun38/core";
import { api, type FirmSummary } from "@/api";
import { colors, radius } from "@/theme";

export default function FavorilerScreen() {
  const router = useRouter();
  const [firms, setFirms] = useState<FirmSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await api.listFavorites();
      setFirms(r.firms);
    } catch {
      setFirms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  if (loading) return <ActivityIndicator color={colors.brand} style={{ marginTop: 40 }} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <FlatList
        data={firms}
        keyExtractor={(f) => f.slug}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Text style={{ fontSize: 36 }}>🤍</Text>
            <Text style={{ color: colors.muted, marginTop: 8, textAlign: "center" }}>Henüz favori firmanız yok.{"\n"}Firma sayfalarında kalp ile ekleyebilirsiniz.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const cat = CATEGORY_BY_SLUG[item.categorySlug];
          const img = api.mediaUrl(item.imageUrl);
          const districts = item.districts.map((d) => DISTRICT_BY_SLUG[d]?.name).filter(Boolean).slice(0, 2).join(", ");
          return (
            <Pressable style={styles.card} onPress={() => router.push(`/firma/${item.slug}`)}>
              {img ? <Image source={{ uri: img }} style={styles.img} /> : <View style={[styles.img, styles.center]}><Text style={{ fontSize: 30 }}>{cat?.icon}</Text></View>}
              <View style={{ flex: 1, padding: 12 }}>
                <Text style={{ fontWeight: "700", color: colors.ink }} numberOfLines={1}>{item.businessName}</Text>
                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{cat?.name} · {districts}</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
                  <Text style={{ fontWeight: "700", color: colors.ink, fontSize: 13 }}>
                    {item.pricePerGuest ? `${formatTRY(item.pricePerGuest)}/kişi` : item.minPrice ? `${formatTRY(item.minPrice)}+` : "Teklif al"}
                  </Text>
                  <Text style={{ color: colors.brand, fontSize: 12, fontWeight: "600" }}>★ {item.ratingAvg.toFixed(1)}</Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", borderWidth: 1, borderColor: colors.line, borderRadius: radius, overflow: "hidden", backgroundColor: colors.white },
  img: { width: 90, height: 90, backgroundColor: colors.brandLight },
  center: { alignItems: "center", justifyContent: "center" },
});
