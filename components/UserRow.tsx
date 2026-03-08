import { Tables } from "@/assets/data/types";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

function UserRow({ user }: { user: Tables<"profiles"> }) {
  return (
    <View className="rounded-3xl p-5 bg-black/5">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mr-3">
            <Ionicons name="person" size={24} color="#1DB954" />
          </View>

          <Text className="text-text-primary font-bold text-lg">
            {user.full_name || "Unnamed User"}
          </Text>
        </View>

        {user.group && (
          <View className="bg-primary px-3 py-1 rounded-full">
            <Text className="text-background text-xs font-bold">
              {user.group}
            </Text>
          </View>
        )}
      </View>

      {/* User Details */}
      <View className="ml-15 gap-1">
        {user.username && (
          <Text className="text-text-secondary text-sm">
            @{user.username}
          </Text>
        )}

        {user.phone && (
          <View className="flex-row items-center">
            <Ionicons
              name="call"
              size={12}
              color="#6B7280"
              style={{ marginRight: 6 }}
            />
            <Text className="text-text-secondary text-sm">
              {user.phone}
            </Text>
          </View>
        )}

        <Text className="text-xs text-gray-400 mt-2">
          ID: {user.id.slice(0, 8)}…
        </Text>
      </View>
    </View>
  );
}

export default UserRow;