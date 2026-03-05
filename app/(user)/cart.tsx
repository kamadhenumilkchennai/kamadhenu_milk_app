import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";

import { Tables } from "@/assets/data/types";
import CartListItem from "@/components/CartListItems";
import EmptyState from "@/components/EmptyState";
import GradientHeader from "@/components/GradientHeader";
import LocationModal from "@/components/Location/LocationModal";
import OrderSummeryFooter from "@/components/OrderSummeryFooter";
import { formatDate } from "@/lib/date-format";
import { formatPhone } from "@/lib/utils";
import { useCart } from "@/providers/CartProvider";
import { useLocationContext } from "@/providers/LocationProvider";
import { DeliveryTime, Plan } from "./orders/[id]";

const today = new Date().toISOString().split("T")[0];
// Calculate tomorrow
const tomorrow = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
})();

const deliveryCharge = 0;

const getSubscriptionRangeText = (startDate: string, plan: Plan) => {
  const days = plan === "weekly" ? 7 : 30;
  const endDate = addDays(startDate, days - 1);

  return `${formatDate(startDate)} till ${formatDate(endDate)}`;
};

const addDays = (date: string, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

export default function CartScreen() {
  const { items, total, checkout, isCheckingOut } = useCart();
  const { selectedAddress } = useLocationContext();

  const [locationModalVisible, setLocationModalVisible] = useState(false);

  /* ---------------- SUBSCRIPTION STATE ---------------- */
  const [subscriptionModalVisible, setSubscriptionModalVisible] =
    useState(false);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [plan, setPlan] = useState<Plan>("monthly");
  const [deliveryTime, setDeliveryTime] = useState<DeliveryTime>("morning");
  const [startDate, setStartDate] = useState(tomorrow);

  const [hasChanges, setHasChanges] = useState(false);

  /* ---------------- HELPERS ---------------- */
  const resetSubscription = () => {
    setIsSubscribed(false);
    setPlan("weekly");
    setDeliveryTime("morning");
    setStartDate(today);
    setHasChanges(false);
  };

  useEffect(() => {
    if (items.length === 0) {
      resetSubscription();
    }
  }, [items.length]);

  useEffect(() => {
    if (!selectedAddress) setLocationModalVisible(true);
  }, [selectedAddress]);

  const canCheckout =
    !!selectedAddress?.area && !!selectedAddress?.name && !isCheckingOut;

  /* ---------------- CALENDAR RANGE ---------------- */
  type CalendarMarking = {
    startingDay?: boolean;
    endingDay?: boolean;
    color?: string;
    textColor?: string;
  };

  const markedDates = useMemo(() => {
    const days = plan === "weekly" ? 7 : 30;
    const marks: Record<string, CalendarMarking> = {};

    // Start date (dark)
    marks[startDate] = {
      startingDay: true,
      color: "#16a34a",
      textColor: "white",
    };

    // Following dates (light)
    for (let i = 1; i < days; i++) {
      const date = addDays(startDate, i);
      marks[date] = {
        color: "#86efac",
        textColor: "#064e3b",
      };
    }

    // End date
    const endDate = addDays(startDate, days - 1);
    marks[endDate] = {
      endingDay: true,
      color: "#16a34a",
      textColor: "white",
    };

    return marks;
  }, [plan, startDate]);

  /* ---------------- CHECKOUT ---------------- */
  const handleCheckout = () => {
    if (!canCheckout) return;

    checkout(
      selectedAddress as Tables<"addresses">,
      isSubscribed ? { plan, startDate, deliveryTime } : null,
    );
  };

  /* ---------------- EMPTY CART ---------------- */
  if (!items.length) {
    return (
      <View className="flex-1 bg-background">
        <GradientHeader title="Cart" />
        <EmptyState
          icon="cart-outline"
          title="Your cart is empty"
          description="Looks like you haven’t added anything yet"
          actionLabel="Go to Menu"
          actionHref="/(user)/menu"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <GradientHeader title="Cart" />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CartListItem cartItem={item} />}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 440,
          gap: 12,
        }}
        ListFooterComponent={
          <>
            {/* SUBSCRIBE TILE */}
            <TouchableOpacity
              onPress={() => setSubscriptionModalVisible(true)}
              className="my-4 bg-background-muted p-4 rounded-xl border border-gray-300 flex-row items-center justify-between"
            >
              <View>
                <Text className="font-semibold">
                  {isSubscribed
                    ? `Subscribed • ${plan.toUpperCase()}`
                    : "Subscribe this order"}
                </Text>

                {isSubscribed && (
                  <Text className="text-sm text-gray-500">
                    {getSubscriptionRangeText(startDate, plan)} •{" "}
                    {deliveryTime.toUpperCase()}
                  </Text>
                )}
              </View>

              <Ionicons
                name={isSubscribed ? "checkmark-circle" : "repeat"}
                size={20}
                color={isSubscribed ? "green" : "gray"}
              />
            </TouchableOpacity>

            <OrderSummeryFooter
              itemsTotal={total}
              deliveryCharge={deliveryCharge}
              subscriptionPlan={isSubscribed ? plan : null}
            />
          </>
        }
      />

      {/* CHECKOUT BAR */}
      <View className="absolute bottom-0 left-0 right-0 pt-2 pb-24 px-6 bg-background">
        <View className="mb-3 bg-background-muted p-4 rounded-xl">
          <View className="flex-row justify-between">
            <Text>Deliver to</Text>
            <TouchableOpacity onPress={() => setLocationModalVisible(true)}>
              <Text className="text-primary font-semibold">Change</Text>
            </TouchableOpacity>
          </View>

          {selectedAddress?.area && (
            <>
              <Text className="font-semibold mt-1">{selectedAddress.name}</Text>
              <Text>{selectedAddress.area}</Text>
              <Text>Phone: {formatPhone(selectedAddress.phone)}</Text>
            </>
          )}
        </View>

        <TouchableOpacity
          disabled={!canCheckout}
          onPress={handleCheckout}
          className={`rounded-full py-4 ${
            canCheckout ? "bg-primary" : "bg-gray-400"
          }`}
        >
          <Text className="text-white font-bold text-lg text-center">
            Checkout
          </Text>
        </TouchableOpacity>
      </View>

      {/* SUBSCRIPTION MODAL */}
      <Modal visible={subscriptionModalVisible} transparent>
        <View className="flex-1 bg-black/40 justify-center p-6">
          <View className="bg-background rounded-2xl p-6 gap-5">
            <Text className="text-lg font-bold">Subscription Details</Text>

            {/* PLAN */}
            <View className="flex-row gap-3">
              {(["weekly", "monthly"] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => {
                    setPlan(p);
                    setHasChanges(true);
                  }}
                  className={`px-4 py-2 rounded-full ${
                    plan === p ? "bg-primary" : "bg-background-muted"
                  }`}
                >
                  <Text className={plan === p ? "text-white" : ""}>
                    {p.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* START DATE */}
            <Calendar
              minDate={today}
              markingType="period"
              markedDates={markedDates}
              onDayPress={(d) => {
                setStartDate(d.dateString);
                setHasChanges(true);
              }}
            />

            {/* DELIVERY TIME */}
            <View className="flex-row gap-3">
              {(["morning", "evening"] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => {
                    setDeliveryTime(t);
                    setHasChanges(true);
                  }}
                  className={`px-4 py-2 rounded-full ${
                    deliveryTime === t ? "bg-primary" : "bg-background-muted"
                  }`}
                >
                  <Text className={deliveryTime === t ? "text-white" : ""}>
                    {t.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ACTIONS */}
            <View className="gap-3">
              {(hasChanges || !isSubscribed) && (
                <TouchableOpacity
                  onPress={() => {
                    setIsSubscribed(true);
                    setHasChanges(false);
                    setSubscriptionModalVisible(false);
                  }}
                  className="bg-primary py-3 rounded-xl items-center"
                >
                  <Text className="text-white font-bold">
                    {isSubscribed ? "Update Subscription" : "Save Subscription"}
                  </Text>
                </TouchableOpacity>
              )}

              {isSubscribed && (
                <TouchableOpacity
                  onPress={() => {
                    resetSubscription();
                    setSubscriptionModalVisible(false);
                  }}
                  className="bg-red-500 py-3 rounded-xl items-center"
                >
                  <Text className="text-white font-bold">
                    Cancel Subscription
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => setSubscriptionModalVisible(false)}
                className="py-2 items-center"
              >
                <Text className="text-text-secondary">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
      />

      <StatusBar style="auto" />
    </View>
  );
}
