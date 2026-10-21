import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/auth";
import { colors } from "@/theme";

export default function RootLayout() {
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
          <Stack.Screen name="giris" options={{ title: "Giriş Yap", presentation: "modal" }} />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
