import { useCancelOrder, useOrderDetails } from "@/api/orders";
import { useUpdateOrderSubscription } from "@/api/orders/subscription";
import { useSubscriptionPauses } from "@/api/subscription";
import OrderAddressCard from "@/components/Address/OrderAddressCard";
import GradientHeader from "@/components/GradientHeader";
import OrderItemList from "@/components/OrderItemListItem";
import { normalizeStatus, statusColorMap } from "@/components/OrderListItem";
import OrderSummeryFooter from "@/components/OrderSummeryFooter";
import OrderSubscriptionDetailsCard from "@/components/subscription/OrderSubscriptionDetailsCard";
import SkipDeliveryModal from "@/components/subscription/SkipDeliveryModal";
import { getSubscriptionEndDate } from "@/lib/date-format";
import { generateBillHTML } from "@/utils/billTemplate";
import * as Print from "expo-print";
import { useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type Plan = "weekly" | "monthly";
export type DeliveryTime = "morning" | "evening";

export default function OrderDetailsScreen() {
  /* ---------------- PARAMS ---------------- */
  const { id } = useLocalSearchParams<{ id?: string }>();
  const orderId = Number(id);

  /* ---------------- LOCAL STATE ---------------- */
  const [skipOpen, setSkipOpen] = useState(false);

  const [generatingBill, setGeneratingBill] = useState(false);

  /* ---------------- DATA ---------------- */
  const { data: order, isLoading, error } = useOrderDetails(orderId);
  const { data: skippedDays } = useSubscriptionPauses(order?.subscription?.id);
  const { mutate: cancelOrder, isPending: cancelling } = useCancelOrder();
  const isCancelled = order?.status === "Cancelled";

  useUpdateOrderSubscription(orderId);

  /* ---------------- SAFE DERIVED VALUES ---------------- */
  const subscription = order?.subscription ?? null;
  const isSubscribed = Boolean(subscription);

  const plan: Plan | null =
    subscription?.plan_type === "weekly" ||
    subscription?.plan_type === "monthly"
      ? subscription.plan_type
      : null;

  const startDate = subscription?.start_date ?? null;
  const endDate =
    isSubscribed && startDate && plan
      ? getSubscriptionEndDate(startDate, plan)
      : null;

  const deliveryCharge = 0;

  const itemsTotal = useMemo(() => {
    if (!order) return 0;
    if (!isSubscribed || !plan) return order.total;

    if (plan === "weekly") return order.total / 7;
    if (plan === "monthly") return order.total / 30;

    return order.total;
  }, [order, isSubscribed, plan]);

  const isSubscriptionExpired = useMemo(() => {
    if (!endDate) return false;
    return new Date() > new Date(endDate);
  }, [endDate]);

  const canCancel = order?.status === "New";

  const normalizedStatus = normalizeStatus(order?.status);
  const statusStyle = statusColorMap[normalizedStatus] ?? statusColorMap.new;

  const handleCancelOrder = () => {
    if (!order?.id) return;
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: () =>
          cancelOrder(
            { orderId: order.id },
            {
              onError: (err) => {
                Alert.alert("Error", err.message);
              },
            },
          ),
      },
    ]);
  };

  /* ---------------- BILL ---------------- */
  const handleGenerateBill = async () => {
    if (!order) return;
    const skippedDatesArray = skippedDays?.map((d) => d.pause_date) ?? [];

    try {
      setGeneratingBill(true);

      const html = generateBillHTML({
        order,
        itemsTotal,
        deliveryCharge,
        skippedDates: skippedDatesArray,
      });

      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Order Bill",
        });
      }
    } finally {
      setGeneratingBill(false);
    }
  };

  /* ---------------- UI STATES ---------------- */
  if (!orderId || Number.isNaN(orderId)) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-accent-error text-lg">Invalid Order ID</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#43ce4e" />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-accent-error text-lg">Failed to fetch order</Text>
      </View>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <View className="flex-1 bg-background">
      <GradientHeader title={`Order #${order.id}`} />

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 140,
          paddingHorizontal: 16,
          gap: 16,
        }}
      >
        <View className="flex-row items-center ml-2 mt-2">
          <Text className="text-gray-500 text-lg mr-1">Order Status :</Text>

          <View className={`px-3 py-1 rounded-full ${statusStyle.bg}`}>
            <Text className={`text-sm font-semibold ${statusStyle.text}`}>
              {order.status}
            </Text>
          </View>
        </View>

        {order.addresses && <OrderAddressCard address={order.addresses} />}
        <View className="flex-row gap-3">
          {/* Cancel Order */}
          {canCancel && (
            <TouchableOpacity
              disabled={cancelling}
              onPress={handleCancelOrder}
              className="flex-1 py-3 rounded-lg border border-red-500/40 bg-white"
            >
              <Text className="text-red-500/60 text-center font-semibold">
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Generate Bill */}
          <TouchableOpacity
            disabled={generatingBill}
            onPress={handleGenerateBill}
            className={`flex-1 py-3 rounded-lg ${
              generatingBill ? "bg-gray-400" : "bg-green-600"
            }`}
          >
            <Text className="text-white text-center font-semibold">
              {generatingBill ? "Generating Bill..." : "Generate Bill"}
            </Text>
          </TouchableOpacity>
        </View>

        {subscription && (
          <>
            <OrderSubscriptionDetailsCard subscription={subscription} />

            {!isSubscriptionExpired && !isCancelled && (
              <TouchableOpacity
                onPress={() => setSkipOpen(true)}
                className="flex-1 py-3 rounded-lg border border-red-500/40 bg-white"
              >
                <Text className="text-red-500/60 text-center font-semibold">
                  Skip Delivery Day
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <OrderItemList items={order.order_items ?? []} />

        <OrderSummeryFooter
          itemsTotal={itemsTotal}
          deliveryCharge={deliveryCharge}
          subscriptionPlan={isSubscribed ? plan : null}
          skippedDaysCount={skippedDays?.length ?? 0} // Pass count of skipped days
        />
      </ScrollView>

      {subscription && (
        <SkipDeliveryModal
          visible={skipOpen}
          onClose={() => setSkipOpen(false)}
          subscriptionId={subscription.id}
          startDate={subscription.start_date}
          endDate={endDate}
        />
      )}
    </View>
  );
}
