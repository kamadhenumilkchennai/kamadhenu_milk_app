import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type OverlayHeaderProps = {
  title?: string;
  onBackPress?: () => void;
  centerSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

export default function OverlayHeader({
  title,
  onBackPress,
  centerSlot,
  rightSlot,
}: OverlayHeaderProps) {
  const router = useRouter();

  return (
    <View className="absolute top-0 left-0 right-0 z-50 px-6 pt-14 pb-4 flex-row items-center">
      {/* LEFT: BACK */}
      <TouchableOpacity
        onPress={onBackPress ?? router.back}
        className="w-10 h-10 rounded-full bg-black/40 items-center justify-center"
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* CENTER */}
      <View className="flex-1 ml-3">
        {centerSlot ? (
          centerSlot
        ) : title ? (
          <Text className="text-text-primary text-2xl font-semibold">
            {title}
          </Text>
        ) : null}
      </View>

      {/* RIGHT */}
      <View className="ml-3">
        {rightSlot ?? null}
      </View>
    </View>
  );
}
