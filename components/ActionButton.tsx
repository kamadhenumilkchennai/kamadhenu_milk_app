import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type ActionButtonProps = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  href?: Href; // navigation target
  onPress?: () => void; // optional callback
  className?: string; // optional styling
};

export default function ActionButton({
  label,
  icon = "apps",
  href,
  onPress,
  className = "",
}: ActionButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) return onPress();
    if (href) router.push(href);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      className={`mt-6 rounded-full px-8 py-4 flex-row items-center bg-primary ${className}`}
    >
      {icon && <Ionicons name={icon} size={22} color="#121212" />}
      <Text className="ml-2 font-bold text-base text-inverse">{label}</Text>
    </TouchableOpacity>
  );
}
