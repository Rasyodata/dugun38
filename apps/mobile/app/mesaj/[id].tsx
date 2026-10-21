import { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useFocusEffect, Stack } from "expo-router";
import { formatTRY } from "@dugun38/core";
import { api, type ThreadDetail, type ChatMessage } from "@/api";
import { colors, radius } from "@/theme";

export default function KonusmaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<ThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const load = useCallback(async () => {
    try {
      setData(await api.getThread(String(id)));
    } catch {
      // sessiz
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Odakta 5 sn'de bir yenile (anlık değil)
  useFocusEffect(useCallback(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]));

  useEffect(() => {
    if (data?.messages.length) setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  }, [data?.messages.length]);

  async function send() {
    const body = text.trim();
    if (!body) return;
    setSending(true);
    try {
      await api.sendMessage(String(id), body);
      setText("");
      await load();
    } catch {
      // sessiz
    } finally {
      setSending(false);
    }
  }

  if (loading) return <ActivityIndicator color={colors.brand} style={{ marginTop: 60 }} />;
  if (!data) return <View style={styles.center}><Text style={{ color: colors.muted }}>Konuşma bulunamadı.</Text></View>;

  return (
    <>
      <Stack.Screen options={{ title: data.otherParty }} />
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.cream }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
        <FlatList
          ref={listRef}
          data={data.messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 12, gap: 6 }}
          ListHeaderComponent={
            <View style={{ gap: 6, marginBottom: 6 }}>
              <View style={styles.offerPill}><Text style={{ color: colors.muted, fontSize: 12 }}>Teklif: {formatTRY(data.offerPrice)}</Text></View>
              {!data.canRevealContact && (
                <Text style={styles.lockNote}>🔒 Telefon, e-posta ve IBAN rezervasyona kadar gizlenir.</Text>
              )}
              {data.canRevealContact && data.firmPhone ? (
                <Text style={styles.phonePill}>📞 {data.firmPhone}</Text>
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <View style={{ flexDirection: "row", justifyContent: item.mine ? "flex-end" : "flex-start" }}>
              <View style={[styles.bubble, item.mine ? styles.mine : styles.theirs]}>
                <Text style={[styles.bubbleText, item.mine && { color: colors.white }]}>{item.body}</Text>
                <Text style={[styles.time, item.mine && { color: "#f3c9d6" }]}>
                  {new Date(item.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={{ textAlign: "center", color: colors.muted, marginTop: 20 }}>İlk mesajı siz yazın.</Text>}
        />
        <View style={styles.composer}>
          <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Mesaj yazın…" maxLength={2000} multiline />
          <Pressable style={[styles.sendBtn, (!text.trim() || sending) && { opacity: 0.5 }]} disabled={!text.trim() || sending} onPress={send}>
            <Text style={{ color: colors.white, fontWeight: "700" }}>Gönder</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: "78%", borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  mine: { backgroundColor: colors.brand, borderBottomRightRadius: 4 },
  theirs: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderBottomLeftRadius: 4 },
  bubbleText: { color: colors.ink, fontSize: 14 },
  time: { fontSize: 10, color: colors.muted, marginTop: 3, alignSelf: "flex-end" },
  offerPill: { alignSelf: "center", backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  lockNote: { textAlign: "center", fontSize: 11, color: colors.muted, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 8 },
  phonePill: { alignSelf: "center", color: colors.green, fontWeight: "600", fontSize: 13 },
  composer: { flexDirection: "row", gap: 8, padding: 10, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.white, alignItems: "flex-end" },
  input: { flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, color: colors.ink, maxHeight: 100 },
  sendBtn: { backgroundColor: colors.brand, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.white },
});
