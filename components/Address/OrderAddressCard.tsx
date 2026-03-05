import { Tables } from "@/assets/data/types";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Address = Tables<"addresses">;

type Props = {
  address: Address;
};

export default function OrderAddressCard({ address }: Props) {
  return (
    <View className="rounded-3xl p-5 bg-black/5">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mr-3">
            <Ionicons name="location" size={24} color="#1DB954" />
          </View>

          <Text className="text-text-primary font-bold text-lg">
            Delivery Address
          </Text>
        </View>

        {address.address_type && (
          <View className="bg-primary px-3 py-1 rounded-full">
            <Text className="text-background text-xs font-bold">
              {address.address_type}
            </Text>
          </View>
        )}
      </View>

      {/* Address Details */}
      <View className="ml-15">
        <Text className="text-text-primary font-semibold">
          {address.name}
        </Text>
        {address.landmark && (
          <Text className="text-text-secondary text-sm">
            {address.landmark}, {address.flat ? address.flat : ""}
          </Text>
        )}

        {address.area && (
          <Text className="text-text-secondary text-sm">
            {address.area}
          </Text>
        )}

        <View className="flex-row items-center">
          <Ionicons
            name="call"
            size={12}
            color="#6B7280"
            style={{ marginRight: 6 }}
          />
          <Text className="text-text-secondary text-sm">
            {address.phone}
          </Text>
        </View>
      </View>
    </View>
  );
}
