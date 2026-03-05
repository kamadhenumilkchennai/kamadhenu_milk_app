import logger from "@/lib/logger";
import { registerForPushNotificationsAsync } from "@/lib/notifications";
import { supabase } from "@/lib/supabase";
import * as Notifications from "expo-notifications";
import React, { PropsWithChildren, useEffect, useRef } from "react";
import { useAuth } from "./AuthProvider";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldShowAlert: true,
  }),
});

export default function NotificationProvider({ children }: PropsWithChildren) {
  const { profile } = useAuth();
  const hasRegistered = useRef(false);

  useEffect(() => {
    if (!profile?.id) return; // ⛔ wait for profile
    if (hasRegistered.current) return;

    hasRegistered.current = true;

    registerForPushNotificationsAsync()
      .then(async (token) => {
        if (!token) return;

        // 🔁 Update only if changed
        if (profile.expo_push_token !== token) {
          await supabase
            .from("profiles")
            .update({ expo_push_token: token })
            .eq("id", profile.id);
        }
      })
      .catch((e) => {
        console.warn("Push registration error:", e);
      });

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        logger.log("notification", notification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        logger.log("notification response", response);
      });

    return () => {
      try {
        notificationListener.remove();
      } catch (e) {
        logger.error(
          "NotificationProvider: failed to remove notificationListener",
          e,
        );
      }

      try {
        responseListener.remove();
      } catch (e) {
        logger.error(
          "NotificationProvider: failed to remove responseListener",
          e,
        );
      }
    };
  }, [profile?.id]);

  return <>{children}</>;
}
