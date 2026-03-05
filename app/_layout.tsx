import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect } from "react";
import "../global.css";

import AuthProvider from "@/providers/AuthProvider";
import CartProvider from "@/providers/CartProvider";
import NotificationProvider from "@/providers/NotificationProvider";
import QueryProvider from "@/providers/QueryProvider";

import OfflineBanner from "@/components/OfflineBanner";
import { LocationProvider } from "@/providers/LocationProvider";
import { NetworkProvider } from "@/providers/NetworkProvider";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useColorScheme } from "react-native";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(user)",
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "light" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <InnerNav />
      </AuthProvider>
    </ThemeProvider>
  );
}

function InnerNav() {
  // delay rendering the rest of the app until auth finishes initializing
  const { loading } = require("@/providers/AuthProvider").useAuth();

  if (loading) return null;

  return (
    <QueryProvider>
      <NetworkProvider>
        <OfflineBanner />
        <NotificationProvider>
          <LocationProvider>
            <CartProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(admin)" />
                <Stack.Screen name="(user)" />
              </Stack>
            </CartProvider>
          </LocationProvider>
        </NotificationProvider>
      </NetworkProvider>
    </QueryProvider>
  );
}
