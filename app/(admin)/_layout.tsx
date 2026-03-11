import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Redirect, Tabs } from "expo-router";
import React from "react";

import { useAuth } from "@/providers/AuthProvider";
import { BlurView } from "expo-blur";
import { ActivityIndicator, StyleSheet, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={20} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { profile, loading, session } = useAuth();
  const insets = useSafeAreaInsets();

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!profile || profile.group !== "ADMIN") {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1DB954",
        tabBarInactiveTintColor: "#B3B3B3",

        tabBarStyle: {
          position: "absolute",
          borderTopWidth: 0,

          height: 50, // ✅ increased height

          marginHorizontal: 80,
          borderRadius: 24,
          overflow: "hidden",
          elevation: 0,

          bottom: insets.bottom + 10,

          paddingBottom: 6, // ✅ fixed

          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        },

        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: -3,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="users" options={{ href: null, headerShown: false }} />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="cutlery" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Admin",
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
