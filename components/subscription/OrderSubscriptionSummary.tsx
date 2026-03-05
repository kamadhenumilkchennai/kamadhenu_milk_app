import { Tables } from "@/assets/data/types";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  subscription: Tables<"subscriptions">;
};

export default function OrderSubscriptionSummary({ subscription }: Props) {
  const plan =
    subscription.plan_type === "weekly"
      ? "Weekly Subscription"
      : "Monthly Subscription";

  return (
    <View className="bg-green-50 border border-green-200 rounded-xl p-4 gap-2">
      <View className="flex-row items-center gap-2">
        <Ionicons name="repeat" size={18} color="#16A34A" />
        <Text className="font-semibold text-green-700">
          Subscription Details
        </Text>
      </View>

      <Text className="text-text-primary font-medium">{plan}</Text>

      <Text className="text-text-secondary text-sm">
        Start Date:{" "}
        {new Date(subscription.start_date).toLocaleDateString()}
      </Text>

      <Text className="text-text-secondary text-sm">
        Delivery Time: {subscription.delivery_time}
      </Text>

      {/* <Text className="text-text-secondary text-sm capitalize">
        Status: {subscription.status}
      </Text> */}
    </View>
  );
}
