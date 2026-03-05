import { useSubscriptionPauses } from "@/api/subscription";
import { Tables } from "@/assets/data/types";
import { formatDate, formatFriendlyDate } from "@/lib/date-format";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

type Props = {
  subscription: Tables<"subscriptions">;
};

/* ---------------- HELPERS ---------------- */

/* Normalize date to start of day */
const normalizeDate = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/* Calculate end date based on plan */
const calculateEndDate = (
  startDate: string,
  planType: "weekly" | "monthly"
) => {
  const days = planType === "weekly" ? 6 : 29; // inclusive
  const date = new Date(startDate);
  date.setDate(date.getDate() + days);
  return normalizeDate(date);
};

/* Calculate days left */
const calculateDaysLeft = (endDate: Date, today: Date) => {
  const diff = Math.ceil(
    (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(diff, 0);
};

export default function OrderSubscriptionDetailsCard({ subscription }: Props) {
  const today = normalizeDate(new Date());
  const startDate = normalizeDate(new Date(subscription.start_date));
  const endDate = calculateEndDate(
    subscription.start_date,
    subscription.plan_type as "weekly" | "monthly"
  );

  /* ---------------- SUBSCRIPTION STATE ---------------- */
  let badgeText = "";
  let badgeStyle = "bg-green-600";

  if (today < startDate) {
    badgeText = "Upcoming";
    badgeStyle = "bg-blue-600";
  } else if (today > endDate) {
    badgeText = "Expired";
    badgeStyle = "bg-red-600";
  } else {
    const daysLeft = calculateDaysLeft(endDate, today);
    badgeText = `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`;
    badgeStyle = daysLeft <= 2 ? "bg-yellow-500" : "bg-green-600";
  }

  const planLabel =
    subscription.plan_type === "weekly"
      ? "Weekly Subscription"
      : "Monthly Subscription";

  /* ---------------- FETCH SKIPPED DAYS ---------------- */
  const { data: pausedDays } = useSubscriptionPauses(subscription.id);

  return (
    <View className="bg-green-50 border border-green-200 rounded-xl p-4 gap-2 relative">
      {/* ✅ STATUS BADGE */}
      <View
        className={`absolute top-3 right-3 px-3 py-1 rounded-full ${badgeStyle}`}
      >
        <Text className="text-white text-xs font-bold">{badgeText}</Text>
      </View>

      {/* HEADER */}
      <View className="flex-row items-center gap-2">
        <Ionicons name="repeat" size={18} color="#16A34A" />
        <Text className="text-green-700 font-semibold">
          Subscription Details
        </Text>
      </View>

      {/* PLAN */}
      <View className="flex-row justify-between">
        <Text className="text-text-secondary">Plan</Text>
        <Text className="font-medium text-text-primary">{planLabel}</Text>
      </View>

      {/* DURATION */}
      <View className="flex-row justify-between">
        <Text className="text-text-secondary">Duration</Text>
        <Text className="font-medium text-text-primary">
          {formatDate(subscription.start_date)} -{" "}
          {formatDate(endDate.toISOString())}
        </Text>
      </View>

      {/* DELIVERY TIME */}
      <View className="flex-row justify-between">
        <Text className="text-text-secondary">Delivery Time</Text>
        <Text className="font-medium text-text-primary capitalize">
          {subscription.delivery_time}
        </Text>
      </View>

      {/* SKIPPED DAYS */}
      {pausedDays && pausedDays.length > 0 && (
        <View className="mt-3">
          <Text className="text-text-secondary font-semibold mb-1">
            Skipped Days
          </Text>
          <ScrollView horizontal className="flex-row gap-2">
            {pausedDays.map((p) => (
              <View
                key={p.id}
                className="bg-red-100 border border-red-300 rounded-lg px-2 py-1 mr-2"
              >
                <Text className="text-red-600 text-sm">
                  {formatFriendlyDate(p.pause_date)}
                  {p.reason ? ` - ${p.reason}` : ""}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
