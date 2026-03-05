import { BaseOrder, OrderWithItems } from "@/api/orders";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Link, useSegments } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { defaultImage } from "@/utils/branding";
import RemoteImage from "./RemoteImage";

dayjs.extend(relativeTime);

type Props = {
  order: BaseOrder | OrderWithItems;
};

export const normalizeStatus = (status?: string) =>
  status?.toLowerCase() ?? "new";

export const statusColorMap: Record<string, { bg: string; text: string }> = {
  new: { bg: "bg-accent-warning/15", text: "text-accent-warning" },
  delivering: { bg: "bg-accent-info/15", text: "text-accent-info" },
  delivered: { bg: "bg-accent-success/15", text: "text-accent-success" },
  cancelled: { bg: "bg-accent-error/15", text: "text-accent-error" },
};

/* ---------------- HELPERS ---------------- */

const normalizeDate = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const calculateEndDate = (
  startDate: string,
  planType: "weekly" | "monthly"
) => {
  const days = planType === "weekly" ? 6 : 29;
  const date = new Date(startDate);
  date.setDate(date.getDate() + days);
  return normalizeDate(date);
};

const getSubscriptionBadge = (order: OrderWithItems) => {
  if (!order.subscription) return null;

  const today = normalizeDate(new Date());
  const startDate = normalizeDate(new Date(order.subscription.start_date));
  const endDate = calculateEndDate(
    order.subscription.start_date,
    order.subscription.plan_type as "weekly" | "monthly"
  );

  if (today < startDate) {
    return { text: "Upcoming", style: "bg-blue-600" };
  }

  if (today > endDate) {
    return { text: "Expired", style: "bg-red-600" };
  }

  const daysLeft = Math.max(
    Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    ),
    0
  );

  return {
    text: `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`,
    style: daysLeft <= 2 ? "bg-yellow-500" : "bg-green-600",
  };
};

/* ✅ Correct subscription check */
const isSubscriptionOrder = (
  order: BaseOrder | OrderWithItems
): order is OrderWithItems => {
  return "subscription" in order && order.subscription !== null;
};

export default function OrderListItem({ order }: Props) {
  const segments = useSegments();

  const status =
    statusColorMap[order.status?.toLowerCase() ?? "new"] ?? statusColorMap.new;

  const items =
    "order_items" in order && Array.isArray(order.order_items)
      ? order.order_items
      : [];

  const subscriptionBadge = isSubscriptionOrder(order)
    ? getSubscriptionBadge(order)
    : null;

  return (
    <View className="rounded-3xl p-5 bg-black/5 mx-3">
      {/* Header */}
      <Link href={`/${segments[0]}/orders/${order.id}`} asChild>
        <Pressable>
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 pr-4">
              <View className="flex-row gap-2 flex-wrap items-center">
                <Text className="text-text-primary font-semibold text-base">
                  Order #{String(order.id).slice(-8)}
                </Text>

                {/* ✅ Subscription badge with days left */}
                {subscriptionBadge && (
                  <View
                    className={`px-2 py-0.5 rounded-full ${subscriptionBadge.style}`}
                  >
                    <Text className="text-xs text-white font-semibold">
                      {subscriptionBadge.text}
                    </Text>
                  </View>
                )}
              </View>

              <Text className="text-text-secondary text-sm mt-1">
                ₹ {Number(order.total ?? 0).toFixed(2)}
                <Text className="opacity-60"> • </Text>
                {dayjs(order.created_at).fromNow()}
              </Text>
            </View>

            <View className={`px-3 py-1.5 rounded-full ${status.bg}`}>
              <Text
                className={`text-xs font-semibold capitalize ${status.text}`}
              >
                {order.status}
              </Text>
            </View>
          </View>
        </Pressable>
      </Link>

      {/* Items */}
      {items.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
        >
          {items.map((item) => (
            <View key={item.id} className="relative">
              <RemoteImage
                path={item.products?.image ?? undefined}
                fallback={defaultImage}
                className="w-16 h-16 rounded-xl bg-black/10"
              />

              <View className="absolute -top-1 -right-1 bg-primary rounded-full min-w-[16px] h-6 items-center justify-center shadow-md px-1">
                <Text className="text-text-inverse text-xs font-bold">
                  ×{item.quantity}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
