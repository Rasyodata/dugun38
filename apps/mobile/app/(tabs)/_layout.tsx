import { Tabs } from "expo-router";
import { Text, type ColorValue } from "react-native";
import { colors } from "@/theme";

function icon(emoji: string) {
  return ({ color }: { color: ColorValue }) => <Text style={{ fontSize: 20, color }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        headerStyle: { backgroundColor: colors.white },
        headerTitleStyle: { color: colors.ink, fontWeight: "700" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Ara", tabBarIcon: icon("🔍"), headerTitle: "Düğün38" }} />
      <Tabs.Screen name="teklif" options={{ title: "Teklif Al", tabBarIcon: icon("📨") }} />
      <Tabs.Screen name="tekliflerim" options={{ title: "Tekliflerim", tabBarIcon: icon("📋") }} />
      <Tabs.Screen name="hesabim" options={{ title: "Hesabım", tabBarIcon: icon("👤") }} />
    </Tabs>
  );
}
