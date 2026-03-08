import { useAuth } from "@/providers/AuthProvider";
import { Redirect, Stack, useRootNavigationState } from "expo-router";

export default function AuthLayout() {
  const { session, loading } = useAuth();
  const rootNavigationState = useRootNavigationState();

  if (loading) return null; // ⬅️ WAIT

  // Allow reset-password screen even without session (deep link from email)
  if (session && rootNavigationState?.routes?.[0]?.name !== "reset-password") {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
