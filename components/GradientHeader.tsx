import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type Props = { title: string; onBackPress?: () => void };

export default function GradientHeader({ title, onBackPress }: Props) {
  return (
    <LinearGradient
      colors={["#43ce4eff", "#ffffffff"]} // ✅ vertical gradient
      className="pt-16 pb-5 px-4 pl-6"
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View className="flex-row items-center gap-2">
        {/* LEFT: BACK */}
        <TouchableOpacity
          onPress={onBackPress ?? router.back}
          className="w-8 h-8 rounded-full bg-black/30 items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={16} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-text-primary font-bold text-2xl">{title}</Text>
      </View>
    </LinearGradient>
  );
}
