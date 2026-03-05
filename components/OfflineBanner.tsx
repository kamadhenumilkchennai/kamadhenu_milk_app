import { useNetwork } from "@/providers/NetworkProvider";
import { useQueryClient } from "@tanstack/react-query";
import { Text, TouchableOpacity, View } from "react-native";

export default function OfflineBanner() {
  const { isConnected } = useNetwork();
  const queryClient = useQueryClient();

  if (isConnected) return null;

  return (
    <View className="bg-red-600 px-4 py-3 flex-row items-center justify-between">
      <Text className="text-white font-semibold">
        No internet connection
      </Text>

      <TouchableOpacity
        onPress={() =>
          queryClient.invalidateQueries({ refetchType: "active" })
        }
      >
        <Text className="text-white font-bold underline">
          Retry
        </Text>
      </TouchableOpacity>
    </View>
  );
}
