import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { CATEGORY_BY_SLUG, DISTRICT_BY_SLUG, formatTRY, calcDeposit } from "@dugun38/core";
import { api, type OfferRequestItem, type ReservationListItem } from "@/api";
import { useAuth } from "@/auth";
import { colors, radius } from "@/theme";

const RES_LABEL: Record<string, string> = {
  PENDING_DEPOSIT: "Kaparo bekleniyor", DEPOSIT_HELD: "Kaparo güvende", COMPLETED: "Tamamlandı",
  DISPUTED: "İtiraz incelemede", REFUNDED: "İade edildi", CANCELLED: "İptal",
};

export default function TekliflerimScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<OfferRequestItem[]>([]);
  const [reservations, setReservations] = useState<ReservationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const [r, res] = await Promise.all([api.myOfferRequests(), api.listReservations()]);
      setRequests(r.requests);
      setReservations(res.reservations);
    } catch {
      // sessiz
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  async function accept(offerId: string, price: number) {
    Alert.alert("Teklifi kabul et", `Kaparo: ${formatTRY(calcDeposit(price))} (%20). Rezervasyon oluşturulsun mu?`, [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Kabul et", onPress: async () => {
          setAccepting(offerId);
          try {
            const r = await api.acceptOffer(offerId);
            router.push(`/rezervasyon/${r.reservationId}`);
          } catch (e) {
            Alert.alert("Hata", e instanceof Error ? e.message : "Başarısız");
          } finally {
            setAccepting(null);
          }
        },
      },
    ]);
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 40 }}>📋</Text>
        <Text style={styles.loginTitle}>Tekliflerinizi görmek için giriş yapın</Text>
        <Pressable style={styles.primaryBtn} onPress={() => router.push("/giris")}>
          <Text style={styles.primaryBtnText}>Giriş Yap</Text>
        </Pressable>
      </View>
    );
  }

  if (loading) return <ActivityIndicator color={colors.brand} style={{ marginTop: 40 }} />;

  return (
    <ScrollView
      style={{ backgroundColor: colors.white }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.brand} />}
    >
      {/* Rezervasyonlar */}
      {reservations.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Rezervasyonlarım</Text>
          {reservations.map((r) => (
            <Pressable key={r.id} style={styles.resCard} onPress={() => router.push(`/rezervasyon/${r.id}`)}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700", color: colors.ink }}>{r.firmName}</Text>
                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                  {formatTRY(r.totalAmount)} · {new Date(r.eventDate).toLocaleDateString("tr-TR")}
                </Text>
              </View>
              <Text style={[styles.resBadge, r.status === "COMPLETED" && { backgroundColor: "#e7f6ee", color: colors.green }]}>
                {RES_LABEL[r.status] ?? r.status}
              </Text>
            </Pressable>
          ))}
        </>
      )}

      {/* Teklif talepleri */}
      <Text style={[styles.sectionTitle, { marginTop: reservations.length ? 20 : 0 }]}>Teklif Taleplerim</Text>
      {requests.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ color: colors.muted, textAlign: "center" }}>Henüz teklif talebiniz yok.</Text>
          <Pressable style={styles.primaryBtn} onPress={() => router.push("/teklif")}>
            <Text style={styles.primaryBtnText}>Tek formla teklif al</Text>
          </Pressable>
        </View>
      ) : (
        requests.map((req) => {
          const cat = CATEGORY_BY_SLUG[req.categorySlug];
          const dist = DISTRICT_BY_SLUG[req.districtSlug];
          const hasAccepted = req.offers.some((o) => o.reservationId);
          return (
            <View key={req.id} style={styles.reqCard}>
              <Text style={{ fontWeight: "700", color: colors.ink }}>{cat?.icon} {cat?.name} · {dist?.name}</Text>
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                {req.guests ? `${req.guests} kişi · ` : ""}{new Date(req.eventDate).toLocaleDateString("tr-TR")}
                {req.budget ? ` · Bütçe ${formatTRY(req.budget)}` : ""}
              </Text>

              {req.offers.length === 0 ? (
                <Text style={{ color: colors.muted, fontSize: 13, marginTop: 10 }}>Henüz teklif gelmedi. Firmalara iletildi.</Text>
              ) : (
                <View style={{ marginTop: 10, gap: 8 }}>
                  {req.offers.map((o) => (
                    <View key={o.id} style={[styles.offer, o.reservationId && styles.offerAccepted]}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ fontWeight: "600", color: colors.ink, flex: 1 }} numberOfLines={1}>{o.firm.businessName}</Text>
                        <Text style={{ color: colors.brand, fontSize: 12 }}>★ {o.firm.ratingAvg.toFixed(1)}</Text>
                      </View>
                      <Text style={{ fontSize: 20, fontWeight: "800", color: colors.ink, marginTop: 4 }}>{formatTRY(o.price)}</Text>
                      {o.message ? <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={2}>{o.message}</Text> : null}
                      {o.reservationId ? (
                        <Pressable style={styles.outlineBtn} onPress={() => router.push(`/rezervasyon/${o.reservationId}`)}>
                          <Text style={styles.outlineBtnText}>Rezervasyonu gör</Text>
                        </Pressable>
                      ) : hasAccepted ? (
                        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8 }}>Başka teklif kabul edildi</Text>
                      ) : (
                        <Pressable style={styles.acceptBtn} disabled={accepting === o.id} onPress={() => accept(o.id, o.price)}>
                          <Text style={styles.acceptBtnText}>{accepting === o.id ? "…" : `Kabul et · kaparo ${formatTRY(calcDeposit(o.price))}`}</Text>
                        </Pressable>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.ink, marginBottom: 10 },
  resCard: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.line, borderRadius: radius, padding: 12, marginBottom: 8 },
  resBadge: { fontSize: 11, fontWeight: "600", color: colors.brand, backgroundColor: colors.brandLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, overflow: "hidden" },
  reqCard: { borderWidth: 1, borderColor: colors.line, borderRadius: radius, padding: 14, marginBottom: 12 },
  offer: { borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12 },
  offerAccepted: { borderColor: colors.green, backgroundColor: "#f3fbf6" },
  acceptBtn: { backgroundColor: colors.brand, borderRadius: 8, paddingVertical: 10, alignItems: "center", marginTop: 8 },
  acceptBtnText: { color: colors.white, fontWeight: "700", fontSize: 13 },
  outlineBtn: { borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingVertical: 10, alignItems: "center", marginTop: 8 },
  outlineBtnText: { color: colors.ink, fontWeight: "600", fontSize: 13 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.white, padding: 24 },
  loginTitle: { fontSize: 18, fontWeight: "700", color: colors.ink, marginTop: 12, textAlign: "center" },
  empty: { alignItems: "center", padding: 20 },
  primaryBtn: { backgroundColor: colors.brand, borderRadius: radius, paddingVertical: 14, paddingHorizontal: 32, alignItems: "center", marginTop: 16 },
  primaryBtnText: { color: colors.white, fontWeight: "700", fontSize: 15 },
});
