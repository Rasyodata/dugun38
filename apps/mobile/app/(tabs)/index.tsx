import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, FlatList, Pressable, Image, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { CATEGORIES, DISTRICTS, CATEGORY_BY_SLUG, DISTRICT_BY_SLUG, formatTRY } from "@dugun38/core";
import { api, type FirmSummary } from "@/api";
import { colors, radius } from "@/theme";

export default function SearchScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [firms, setFirms] = useState<FirmSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.searchFirms({ category: category || undefined, district: district || undefined, sort: "relevance" });
      setFirms(r.firms);
      setTotal(r.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }, [category, district]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      {/* Filtreler */}
      <View style={styles.filters}>
        <Text style={styles.filterLabel}>Kategori</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
          <Chip label="Tümü" active={category === ""} onPress={() => setCategory("")} />
          {CATEGORIES.map((c) => (
            <Chip key={c.slug} label={`${c.icon} ${c.name}`} active={category === c.slug} onPress={() => setCategory(c.slug)} />
          ))}
        </ScrollView>

        <Text style={[styles.filterLabel, { marginTop: 10 }]}>İlçe</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
          <Chip label="Tüm Kayseri" active={district === ""} onPress={() => setDistrict("")} />
          {DISTRICTS.map((d) => (
            <Chip key={d.slug} label={d.name} active={district === d.slug} onPress={() => setDistrict(d.slug)} />
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: colors.muted, textAlign: "center" }}>{error}</Text>
          <Pressable onPress={load} style={styles.retry}><Text style={{ color: colors.white, fontWeight: "600" }}>Tekrar dene</Text></Pressable>
        </View>
      ) : (
        <FlatList
          data={firms}
          keyExtractor={(f) => f.slug}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          ListHeaderComponent={<Text style={{ color: colors.muted, marginBottom: 4 }}>{total} firma</Text>}
          ListEmptyComponent={<Text style={{ color: colors.muted, textAlign: "center", marginTop: 20 }}>Firma bulunamadı.</Text>}
          renderItem={({ item }) => <FirmRow firm={item} onPress={() => router.push(`/firma/${item.slug}`)} />}
        />
      )}
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

function FirmRow({ firm, onPress }: { firm: FirmSummary; onPress: () => void }) {
  const cat = CATEGORY_BY_SLUG[firm.categorySlug];
  const img = api.mediaUrl(firm.imageUrl);
  const districts = firm.districts.map((d) => DISTRICT_BY_SLUG[d]?.name).filter(Boolean).slice(0, 2).join(", ");
  return (
    <Pressable onPress={onPress} style={styles.card}>
      {img ? (
        <Image source={{ uri: img }} style={styles.cardImg} />
      ) : (
        <View style={[styles.cardImg, styles.center]}><Text style={{ fontSize: 32 }}>{cat?.icon ?? "💍"}</Text></View>
      )}
      <View style={{ flex: 1, padding: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.cardTitle} numberOfLines={1}>{firm.businessName}</Text>
          {firm.showcase && <Text style={styles.showcase}>⭐</Text>}
        </View>
        <Text style={styles.cardSub}>{cat?.name} · {districts}</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6, alignItems: "center" }}>
          <Text style={styles.price}>
            {firm.pricePerGuest ? `${formatTRY(firm.pricePerGuest)}/kişi` : firm.minPrice ? `${formatTRY(firm.minPrice)}+` : "Teklif al"}
          </Text>
          <Text style={styles.rating}>★ {firm.ratingAvg.toFixed(1)} ({firm.ratingCount})</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filters: { paddingVertical: 12, paddingLeft: 16, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: colors.cream },
  filterLabel: { fontSize: 12, fontWeight: "600", color: colors.muted, marginBottom: 6 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { fontSize: 13, color: colors.ink },
  card: { flexDirection: "row", backgroundColor: colors.white, borderRadius: radius, borderWidth: 1, borderColor: colors.line, overflow: "hidden" },
  cardImg: { width: 96, height: 96, backgroundColor: colors.brandLight },
  cardTitle: { fontWeight: "700", color: colors.ink, flex: 1, fontSize: 15 },
  cardSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  price: { fontWeight: "700", color: colors.ink, fontSize: 14 },
  rating: { color: colors.brand, fontSize: 12, fontWeight: "600" },
  showcase: { fontSize: 14 },
  center: { alignItems: "center", justifyContent: "center" },
  retry: { backgroundColor: colors.brand, paddingVertical: 10, paddingHorizontal: 20, borderRadius: radius, marginTop: 12 },
});
