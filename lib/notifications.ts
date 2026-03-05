import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Database, Tables } from "./database.types";
import logger from "./logger";
import { supabase } from "./supabase";

/* ---------------- REGISTER FOR PUSH ---------------- */

export async function registerForPushNotificationsAsync(): Promise<
  string | undefined
> {
  let token: string | undefined;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (!Device.isDevice) {
    alert("Must use physical device for Push Notifications");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Failed to get push token for push notification!");
    return;
  }

  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) throw new Error("Project ID not found");

    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch (e: unknown) {
    logger.error("Push token error", e);
  }

  return token;
}

/* ---------------- SEND PUSH & LOG ---------------- */

export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
  recipientId?: string,
  subscriptionId?: number,
) {
  if (!expoPushToken) return;

  let status: "sent" | "failed" = "sent";
  let errorText: string | null = null;

  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: expoPushToken,
        sound: "default",
        title,
        body,
        data,
      }),
    });
  } catch (e: unknown) {
    status = "failed";
    // best-effort stringification
    errorText = (e as Error)?.message ?? String(e);
  }

  // Log in notifications table
  await supabase.from("notifications").insert({
    recipient_id: recipientId ?? null,
    subscription_id: subscriptionId ?? null,
    type:
      data && typeof (data as Record<string, unknown>)?.type === "string"
        ? ((data as Record<string, unknown>).type as string)
        : "general",
    title,
    body,
    data: data ?? null,
    sent_at: new Date().toISOString(),
    status,
    error: errorText,
  } as unknown as Database["public"]["Tables"]["notifications"]["Insert"]);
}

/* ---------------- GET USER TOKEN ---------------- */

export async function getUserToken(
  userId: Tables<"profiles">["id"],
): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("expo_push_token")
    .eq("id", userId)
    .single();

  if (error) {
    logger.error("Failed to fetch user token", error);
    return null;
  }

  return data?.expo_push_token ?? null;
}

/* ---------------- ORDER NOTIFICATION ---------------- */

export async function notifyUserAboutOrderUpdate(order: Tables<"orders">) {
  if (!order.user_id) return;

  const token = await getUserToken(order.user_id);
  if (!token) return;

  const title = `Order #${order.id} updated`;
  const body = `Your order status is now ${order.status}`;

  await sendPushNotification(
    token,
    title,
    body,
    { type: "order-update" },
    order.user_id,
    order.id,
  );
}

/* ---------------- ADMIN / DELIVERY NOTIFICATION FOR SKIP ---------------- */

type SkipNotificationInput = {
  subscriptionId: number;
  dates: string[];
  reason?: string;
};

async function getAdminTokens(): Promise<string[]> {
  const { data } = await supabase
    .from("profiles")
    .select("expo_push_token")
    .eq("role", "admin")
    .not("expo_push_token", "is", null);

  return data?.map((u) => u.expo_push_token!) ?? [];
}

async function getDeliveryTokens(): Promise<string[]> {
  const { data } = await supabase
    .from("profiles")
    .select("expo_push_token")
    .eq("role", "delivery")
    .not("expo_push_token", "is", null);

  return data?.map((u) => u.expo_push_token!) ?? [];
}

export async function notifyAdminsAboutSkip({
  subscriptionId,
  dates,
  reason,
}: SkipNotificationInput) {
  const adminTokens = await getAdminTokens();
  const deliveryTokens = await getDeliveryTokens();

  const allRecipients = [
    ...adminTokens.map((t) => ({ token: t, role: "admin" })),
    ...deliveryTokens.map((t) => ({ token: t, role: "delivery" })),
  ];

  if (!allRecipients.length) return;

  const title = "Delivery Skipped 🚫";
  const body = `Subscription #${subscriptionId} skipped for ${dates.length} day(s)${
    reason ? `\nReason: ${reason}` : ""
  }`;

  await Promise.all(
    allRecipients.map(({ token }) =>
      sendPushNotification(
        token,
        title,
        body,
        { type: "subscription-skip", subscriptionId, dates },
        undefined,
        subscriptionId,
      ),
    ),
  );
}
