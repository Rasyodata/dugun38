import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { api } from "./api";

// Bildirimler uygulama açıkken de gösterilsin
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function getProjectId(): string | undefined {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
  return extra?.eas?.projectId ?? (Constants as unknown as { easConfig?: { projectId?: string } }).easConfig?.projectId;
}

/**
 * Push izni iste, Expo push token al ve sunucuya kaydet.
 * Not: Gerçek token için EAS projectId gerekir (app.json > extra.eas.projectId).
 * Yoksa sessizce atlanır; `eas init` sonrası otomatik çalışır.
 */
export async function registerForPush(): Promise<void> {
  try {
    if (!Device.isDevice) return; // emülatör/simülatör push alamaz

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Düğün38",
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: "#c62c5a",
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== "granted") {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== "granted") return;

    const projectId = getProjectId();
    if (!projectId) {
      console.log("[push] EAS projectId yok — token alınamadı (eas init gerekli).");
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    await api.registerPushToken(token, Platform.OS === "ios" ? "ios" : "android");
  } catch (e) {
    console.log("[push] kayıt atlandı:", e instanceof Error ? e.message : e);
  }
}

/** Bildirime dokununca ilgili ekrana götürür. */
export function addNotificationTapListener(onTap: (data: Record<string, unknown>) => void) {
  return Notifications.addNotificationResponseReceivedListener((resp) => {
    onTap(resp.notification.request.content.data ?? {});
  });
}
