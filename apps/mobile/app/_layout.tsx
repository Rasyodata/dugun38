import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/auth";
import { addNotificationTapListener } from "@/push";
import { colors } from "@/theme";

export default function RootLayout() {
  const router = useRouter();

  // Bildirime dokununca ilgili ekrana götür
  useEffect(() => {
    const sub = addNotificationTapListener((data) => {
      const type = data.type as string | undefined;
      if (type === "message" && data.threadId) router.push(`/mesaj/${data.threadId}`);
      else if (type === "offer") router.push("/tekliflerim");
      else if (type === "request") router.push("/firma-panel/talepler");
      else if (type === "reservation" && data.reservationId) router.push(`/rezervasyon/${data.reservationId}`);
    });
    return () => sub.remove();
  }, [router]);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.white },
            headerTintColor: colors.brand,
            headerTitleStyle: { color: colors.ink, fontWeight: "700" },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="firma/[slug]" options={{ title: "Firma" }} />
          <Stack.Screen name="rezervasyon/[id]" options={{ title: "Rezervasyon" }} />
          <Stack.Screen name="firma-panel/index" options={{ title: "Firma Paneli" }} />
          <Stack.Screen name="firma-panel/talepler" options={{ title: "Gelen Talepler" }} />
          <Stack.Screen name="admin-panel/index" options={{ title: "Yönetim Paneli" }} />
          <Stack.Screen name="admin-panel/loglar" options={{ title: "Kullanıcı Logları" }} />
          <Stack.Screen name="araclar" options={{ title: "Düğün Araçlarım" }} />
          <Stack.Screen name="favoriler" options={{ title: "Favorilerim" }} />
          <Stack.Screen name="mesajlar" options={{ title: "Mesajlar" }} />
          <Stack.Screen name="mesaj/[id]" options={{ title: "Konuşma" }} />
          <Stack.Screen name="giris" options={{ title: "Giriş Yap", presentation: "modal" }} />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
