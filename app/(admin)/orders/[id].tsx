import { useOrderDetails, useUpdateOrder } from "@/api/orders";
import { useSubscriptionPauses } from "@/api/subscription";
import { Plan } from "@/app/(user)/orders/[id]";
import { OrderStatusList, statusColors } from "@/assets/data/types";
import OrderAddressCard from "@/components/Address/OrderAddressCard";
import OrderItemList from "@/components/OrderItemListItem";
import OrderSummeryFooter, {
  DeliveryTime,
} from "@/components/OrderSummeryFooter";
import OrderSubscriptionDetailsCard from "@/components/subscription/OrderSubscriptionDetailsCard";
import { notifyUserAboutOrderUpdate } from "@/lib/notifications";
import { generateBillHTML } from "@/utils/billTemplate";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { Stack, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AdminOrderDetailScreen() {
  const { id: idString } = useLocalSearchParams();
  const id = Number(typeof idString === "string" ? idString : idString?.[0]);

  const deliveryCharge = 0;
  const [generatingBill, setGeneratingBill] = useState(false);

  const { data: order, isLoading, error } = useOrderDetails(id);
  const { mutate: updateOrder } = useUpdateOrder();
  const { data: skippedDays } = useSubscriptionPauses(order?.subscription?.id);

  /* ---------------- UPDATE STATUS ---------------- */
  const updateOrderStatus = async (status: string) => {
    updateOrder({ id, updatedFields: { status } });
    if (order) await notifyUserAboutOrderUpdate({ ...order, status });
  };

  /* ---------------- CALL CUSTOMER ---------------- */
  const callCustomer = () => {
    if (!order?.addresses?.phone) return;
    Linking.openURL(`tel:${order.addresses.phone}`);
  };

  /* ---------------- BILL GENERATION ---------------- */
  const handleGenerateBill = async () => {
    try {
      setGeneratingBill(true);

      const isSubscribed = Boolean(order?.subscription);
      const plan =
        order?.subscription?.plan_type === "weekly" ||
        order?.subscription?.plan_type === "monthly"
          ? order.subscription.plan_type
          : null;

      const itemsTotal =
        isSubscribed && plan
          ? plan === "weekly"
            ? order!.total / 7
            : order!.total / 30
          : order!.total;

      const html = generateBillHTML({
        order: order!,
        itemsTotal,
        deliveryCharge,
      });

      const { uri } = await Print.printToFileAsync({ html });

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `Order #${order!.id} Bill`,
      });
    } catch (err) {
      console.error("Admin bill generation failed", err);
    } finally {
      setGeneratingBill(false);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (error || !order) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-red-500 text-lg">Failed to load order</Text>
      </View>
    );
  }

  /* ---------------- ORDER SUMMARY ---------------- */
  const isSubscribed = Boolean(order.subscription);

  const plan: Plan | null =
    order.subscription?.plan_type === "weekly" ||
    order.subscription?.plan_type === "monthly"
      ? order.subscription.plan_type
      : null;

  const deliveryTime: DeliveryTime | null =
    order.subscription?.delivery_time === "morning" ||
    order.subscription?.delivery_time === "evening"
      ? order.subscription.delivery_time
      : null;

  const startDate = order.subscription?.start_date ?? null;

  const itemsTotal =
    isSubscribed && plan
      ? plan === "weekly"
        ? order.total / 7
        : order.total / 30
      : order.total;

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: `Order #${order.id}` }} />

      <ScrollView className="p-4" contentContainerStyle={{ gap: 16, paddingBottom: 160 }}>
        {/* ADDRESS */}
        {order.addresses && <OrderAddressCard address={order.addresses} />}

        {/* 🔽 ADMIN BILL DOWNLOAD */}
        <TouchableOpacity
          disabled={generatingBill}
          onPress={handleGenerateBill}
          className={`py-3 rounded-xl ${
            generatingBill ? "bg-gray-400" : "bg-green-600"
          }`}
        >
          <Text className="text-white text-center font-semibold">
            {generatingBill ? "Generating Bill..." : "Download Bill"}
          </Text>
        </TouchableOpacity>

        {/* SUBSCRIPTION */}
        {order.subscription && (
          <OrderSubscriptionDetailsCard subscription={order.subscription} />
        )}

        {/* CALL CUSTOMER */}
        {order.addresses?.phone && (
          <Pressable
            onPress={callCustomer}
            className="flex-row items-center bg-surface rounded-2xl p-4"
          >
            <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mr-3">
              <Ionicons name="call" size={24} color="#1DB954" />
            </View>

            <View>
              <Text className="font-bold text-base">Call Customer</Text>
              <Text className="text-sm text-gray-500">
                {order.addresses.phone}
              </Text>
            </View>
          </Pressable>
        )}


        {/* 📍 View on Map */}
        {order.addresses?.latitude && order.addresses?.longitude && (
          <View className="bg-surface rounded-2xl overflow-hidden">
            <Pressable
              onPress={() => {
                const { latitude, longitude } = order.addresses!;
                const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
                Linking.openURL(url);
              }}
              className="flex-row items-center p-4"
            >
              {/* Icon */}
              <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mr-3">
                <Ionicons name="map" size={24} color="#1DB954" />
              </View>

              {/* Text */}
              <View className="flex-1">
                <Text className="text-text-primary font-bold text-base">
                  View on Map
                </Text>
                <Text className="text-text-secondary text-sm">
                  Open delivery location in Google Maps
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </View>
        )}


        {/* ITEMS */}
        <OrderItemList items={order.order_items ?? []} />

        {/* STATUS CONTROLS */}
        <View className="bg-surface rounded-2xl p-4">
          <Text className="text-lg font-bold mb-2">Order Status</Text>

          <View className="flex-row flex-wrap gap-2">
            {OrderStatusList.map((status) => {
              const isActive = order.status === status;
              const colorClass = statusColors[status];

              return (
                <Pressable
                  key={status}
                  onPress={() => updateOrderStatus(status)}
                  className={`px-4 py-2 rounded-xl border ${
                    isActive ? colorClass : "border-gray-300"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      isActive ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {status}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* SUMMARY */}
        <OrderSummeryFooter
          itemsTotal={itemsTotal}
          deliveryCharge={deliveryCharge}
          subscriptionPlan={isSubscribed ? plan : null}
          skippedDaysCount={skippedDays?.length ?? 0} // Pass count of skipped days
        />
      </ScrollView>
    </View>
  );
}
