import GradientHeader from "@/components/GradientHeader";
import { defaultImage } from "@/utils/branding";
import RemoteProfileImage from "@/components/RemoteProfileImage";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const { profile } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View className="flex-1 bg-white">
      <GradientHeader title="Delivery Profile" />
      {/* ================= HEADER ================= */}
      <View className="px-6 pb-8 pt-6">
        <View className="bg-black/5 rounded-3xl p-6">
          <View className="flex-row items-center">
            <RemoteProfileImage
              path={profile?.avatar_url ?? undefined}
              fallback={defaultImage}
              className="w-20 h-20 rounded-full"
            />

            <View className="flex-1 ml-4">
              <Text className="text-text-primary text-2xl font-bold mb-1">
                {profile?.full_name || "User"}
              </Text>

              {!!profile?.username && (
                <Text className="text-text-secondary text-sm">
                  @{profile.username}
                </Text>
              )}

              {!!profile?.group && (
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

      {/* ================= INFO ================= */}
      <View className="mx-6 mb-4 bg-black/5 rounded-2xl p-4">
        {!!profile?.phone && (
          <View className="flex-row items-center ">
            <Ionicons name="call-outline" size={20} color="#666" />
            <Text className="ml-3 text-text-primary">{profile.phone}</Text>
          </View>
        )}

        {!!profile?.website && (
          <View className="flex-row items-center mt-3">
            <Ionicons name="globe-outline" size={20} color="#666" />
            <Text className="ml-3 text-text-primary">{profile.website}</Text>
          </View>
        )}
      </View>

      {/* ================= USER PANEL ================= */}
      <View className="mx-6 mb-3 bg-black/5 rounded-2xl p-4">
        <TouchableOpacity
          onPress={() => router.push("/(user)")}
          className="flex-row items-center justify-between py-2"
        >
          <View className="flex-row items-center">
            <Ionicons name="shield-outline" size={22} color="#F59E0B" />
            <Text className="text-text-primary font-semibold ml-3">
              User Panel
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* ================= SIGN OUT ================= */}
      <TouchableOpacity
        onPress={handleSignOut}
        className="mx-6 mb-3 bg-black/5 rounded-2xl py-5 flex-row items-center justify-center border border-red-500/20"
      >
        <Ionicons name="log-out-outline" size={22} color="#EF4444" />
        <Text className="text-red-500 font-bold text-base ml-2">Sign Out</Text>
      </TouchableOpacity>

      {/* ================= FOOTER ================= */}
      <Text className="mx-6 text-center text-text-secondary text-xs mt-auto mb-4">
        Version 1.0.0
      </Text>
    </View>
  );
}
