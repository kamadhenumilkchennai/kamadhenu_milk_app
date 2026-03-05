import { useLocationContext } from "@/providers/LocationProvider";
import { BRANDING } from "@/utils/branding";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

type Props = {
  onPress: () => void;
  searchText: string;
  onSearchChange: (text: string) => void;
};

export default function Header({ onPress, searchText, onSearchChange }: Props) {
  const { selectedAddress } = useLocationContext();

  return (
    <LinearGradient
      colors={["#43ce4eff", "#ffffffff"]}
      className="pt-12 pb-4 px-4"
    >
      {/* Top Row */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Image
            source={{ uri: BRANDING.logo }}
            className="w-10 h-10 rounded-full"
          />
          <Text className="font-bold text-xl">{BRANDING.name}</Text>
        </View>

        <View className="flex-row items-center gap-4">
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(user)/wishList")}>
            <Ionicons name="heart-outline" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Address */}
      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center gap-2 mt-3"
      >
        <Ionicons name="location-outline" size={18} />
        <Text className="flex-1 font-medium" numberOfLines={1}>
          {selectedAddress?.area ?? "Select delivery address"}
        </Text>
        <Ionicons name="chevron-down" size={18} />
      </TouchableOpacity>

      {/* 🔍 Search */}
      <View className="flex-row items-center bg-white rounded-full mt-4 px-4">
        <Ionicons name="search-outline" size={20} color="gray" />

        <TextInput
          value={searchText}
          onChangeText={onSearchChange}
          placeholder='Try "curd"'
          className="flex-1 px-3 text-base"
        />

        {/* ❌ Clear button */}
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange("")} hitSlop={10}>
            <Ionicons name="close-circle" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}
