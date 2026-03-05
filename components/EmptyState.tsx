import { Ionicons } from "@expo/vector-icons";
import { Href } from "expo-router";
import { Text, View } from "react-native";
import ActionButton from "./ActionButton";

type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: Href;
};

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6 bg-background">
      <Ionicons name={icon} size={80} color="#9CA3AF" />

      <Text className="text-text-primary font-semibold text-xl mt-4 text-center">
        {title}
      </Text>

      {description && (
        <Text className="text-text-secondary text-center mt-2">
          {description}
        </Text>
      )}

      {actionLabel && actionHref && (
        <ActionButton label={actionLabel} href={actionHref} />
      )}
    </View>
  );
}
