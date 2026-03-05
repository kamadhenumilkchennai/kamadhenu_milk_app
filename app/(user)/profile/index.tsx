import { useMyProfile } from "@/api/profile";
import GradientHeader from "@/components/GradientHeader";
import { defaultImage, defaultProfileImage } from "@/utils/branding";
import RemoteProfileImage from "@/components/RemoteProfileImage";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/* -------------------------------------------------------------------------- */
/*                               MENU CONFIG                                  */
/* -------------------------------------------------------------------------- */

type MenuItem = {
  id: number;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  color: string;
  action: Href;
};

const MENU_ITEMS: readonly MenuItem[] = [
  {
    id: 1,
    icon: "person-outline",
    title: "Edit Profile",
    color: "#3B82F6",
    action: "/(user)/profile/editProfile",
  },
  {
    id: 2,
    icon: "heart-outline",
    title: "Wishlist",
    color: "#EF4444",
    action: "/(user)/wishList",
  },
];

/* -------------------------------------------------------------------------- */
/*                               MENU CARD                                    */
/* -------------------------------------------------------------------------- */

const MenuCard = ({
  item,
  onPress,
}: {
  item: MenuItem;
  onPress: (action: Href) => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.75}
    onPress={() => onPress(item.action)}
    className="bg-black/5 rounded-2xl p-6 items-center justify-center"
  >
    <View
      className="w-16 h-16 rounded-full items-center justify-center mb-4"
      style={{ backgroundColor: item.color + "20" }}
    >
      <Ionicons name={item.icon} size={28} color={item.color} />
    </View>

    <Text className="text-text-primary font-bold text-base text-center">
      {item.title}
    </Text>
  </TouchableOpacity>
);

/* -------------------------------------------------------------------------- */
/*                               PROFILE SCREEN                                */
/* -------------------------------------------------------------------------- */

export default function ProfileScreen() {
  const { data: profile, isLoading } = useMyProfile();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleMenuPress = (action: Href) => {
    router.push(action);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <GradientHeader title="Profile" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
      >
        {/* ================= HEADER ================= */}
        <View className="px-6 pb-8">
          <View className="bg-black/5 rounded-3xl p-6">
            <View className="flex-row items-center">
              <RemoteProfileImage
                path={profile?.avatar_url ?? undefined}
                fallback={defaultProfileImage}
                className="w-20 h-20 rounded-full"
              />

              <View className="flex-1 ml-4">
                <Text className="text-text-primary text-2xl font-bold mb-1">
                  {profile?.full_name || "User"}
                </Text>
                <Text className="text-text-secondary text-sm">
                  @{profile?.username || "username"}
                </Text>
                {profile?.group === "ADMIN" && (
                  <View className="self-start bg-red-100 px-3 py-1 rounded-full mt-1">
                    <Text className="text-red-600 text-xs font-semibold">
                      ADMIN
                    </Text>
                  </View>
                )}
                {profile?.group === "DELIVERY" && (
                  <View className="self-start bg-blue-100 px-3 py-1 rounded-full mt-1">
                    <Text className="text-blue-600 text-xs font-semibold">
                      DELIVERY MANAGER
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* ================= MENU ================= */}
        <View className="mx-6 mb-3">
          <View className="flex-row flex-wrap -mx-2">
            {MENU_ITEMS.map((item) => (
              <View key={item.id} className="w-1/2 px-2 mb-3">
                <MenuCard item={item} onPress={handleMenuPress} />
              </View>
            ))}
          </View>
        </View>

        {/* <View className="mx-6 mb-3">
          <View className="flex-row flex-wrap -mx-2">
            {MENU_ITEMS_TWO.map((item) => (
              <View key={item.id} className="w-1/2 px-2 mb-3">
                <MenuCard item={item} onPress={handleMenuPress} />
              </View>
            ))}
          </View>
        </View> */}

        {/* ================= ADMIN ================= */}
        {profile?.group === "ADMIN" && (
          <View className="mx-6 mb-3 bg-black/5 rounded-2xl p-4">
            <TouchableOpacity
              onPress={() => router.push("/(admin)")}
              className="flex-row items-center justify-between py-2"
            >
              <View className="flex-row items-center">
                <Ionicons name="shield-outline" size={22} color="#F59E0B" />
                <Text className="text-text-primary font-semibold ml-3">
                  Admin Panel
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {/* ================= DELIVERY ================= */}
        {profile?.group === "DELIVERY" && (
          <View className="mx-6 mb-3 bg-black/5 rounded-2xl p-4">
            <TouchableOpacity
              onPress={() => router.push("/(delivery)")}
              className="flex-row items-center justify-between py-2"
            >
              <View className="flex-row items-center">
                <Ionicons name="shield-outline" size={22} color="#F59E0B" />
                <Text className="text-text-primary font-semibold ml-3">
                  Delivery Panel
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {/* ================= SIGN OUT ================= */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="mx-6 mb-3 bg-black/5 rounded-2xl py-5 flex-row items-center justify-center border border-red-500/20"
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text className="text-red-500 font-bold text-base ml-2">
            Sign Out
          </Text>
        </TouchableOpacity>

        <Text className="mx-6 text-center text-text-secondary text-xs">
          Version 1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}
