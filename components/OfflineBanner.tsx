import { useNetwork } from "@/providers/NetworkProvider";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Text, TouchableOpacity, View } from "react-native";

export default function OfflineBanner() {
  const { isConnected } = useNetwork();
  const queryClient = useQueryClient();

  if (isConnected) return null;

  return (
    <View style={{ flex: 1 }}>
      {/* Gradient Background */}
      <LinearGradient
        colors={["#1bcf5aff", "#ffffff", "#f9fafb"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: "absolute",
          inset: 0,
        }}
      />

      {/* Content */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Icon */}
        <View className="bg-white rounded-full p-6 mb-6 shadow-md">
          <Ionicons name="wifi-outline" size={60} color="#9CA3AF" />
          <Ionicons
            name="close"
            size={28}
            color="#EF4444"
            style={{ position: "absolute", right: -4, top: -4 }}
          />
        </View>

        {/* Title */}
        <Text className="text-text-primary font-semibold text-xl text-center">
          No internet connection
        </Text>

        {/* Description */}
        <Text className="text-text-secondary text-center mt-2 px-6">
          Please check your internet connection and try again
        </Text>

        {/* Retry Button */}
        <TouchableOpacity
          onPress={() =>
            queryClient.invalidateQueries({ refetchType: "active" })
          }
          className="mt-6 bg-black px-6 py-3 rounded-full"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
