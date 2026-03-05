import React, { useMemo } from "react";
import { Text, View } from "react-native";

export type SubscriptionPlan = "weekly" | "monthly" | null;
export type DeliveryTime = "morning" | "evening" | null;

export type OrderBillFooterProps = {
  itemsTotal: number;
  deliveryCharge?: number;
  subscriptionPlan?: SubscriptionPlan;
  skippedDaysCount?: number;
};

const PLAN_DAYS: Record<Exclude<SubscriptionPlan, null>, number> = {
  weekly: 7,
  monthly: 30,
};

const OrderSummeryFooter = ({
  itemsTotal,
  deliveryCharge = 0,
  subscriptionPlan = null,
  skippedDaysCount = 0,
}: OrderBillFooterProps) => {
  const subscriptionDays = subscriptionPlan ? PLAN_DAYS[subscriptionPlan] : 1;
  const effectiveDays = subscriptionDays - skippedDaysCount;

  const skipAmount = useMemo(
    () => itemsTotal * skippedDaysCount,
    [itemsTotal, skippedDaysCount]
  );

  const subscriptionItemsTotal = useMemo(
    () => itemsTotal * effectiveDays,
    [itemsTotal, effectiveDays]
  );

  const totalBeforeDelivery = subscriptionPlan
    ? itemsTotal * subscriptionDays
    : itemsTotal;

  const grandTotal = subscriptionItemsTotal + deliveryCharge;

  return (
    <View className="bg-background-card rounded-3xl p-5 bg-black/5">
      <Text className="text-text-primary text-xl font-bold mb-4">Summary</Text>

      <View className="space-y-2">
        {/* Per day total */}
        <View className="flex-row justify-between">
          <Text className="text-text-secondary">
            Items Total {subscriptionPlan ? "(per day)" : ""}
          </Text>
          <Text className="font-bold">₹ {itemsTotal.toFixed(2)}</Text>
        </View>

        {subscriptionPlan && (
          <>
            {/* Plan */}
            <View className="flex-row justify-between">
              <Text className="text-text-secondary">Plan</Text>
              <Text className="font-bold capitalize">{subscriptionPlan}</Text>
            </View>

            {/* Items × total plan days */}
            <View className="flex-row justify-between">
              <Text className="text-text-secondary">
                Items × {subscriptionDays} days
              </Text>
              <Text className="font-bold">
                ₹ {totalBeforeDelivery.toFixed(2)}
              </Text>
            </View>

            {/* Skipped Days */}
            {skippedDaysCount > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-text-secondary">
                  Skipped Days ({skippedDaysCount})
                </Text>
                <Text className="font-bold">- ₹ {skipAmount.toFixed(2)}</Text>
              </View>
            )}
            {/* Items × effective days */}
            {skippedDaysCount > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-text-secondary">
                  Items × {effectiveDays} days (after skipped)
                </Text>
                <Text className="font-bold">
                  ₹ {subscriptionItemsTotal.toFixed(2)}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Delivery */}
        <View className="flex-row justify-between">
          <Text className="text-text-secondary">Delivery Charge</Text>
          <Text className="font-bold">₹ {deliveryCharge.toFixed(2)}</Text>
        </View>

        {/* Grand Total */}
        <View className="flex-row justify-between mt-2">
          <Text className="text-text-primary font-bold text-lg">Total</Text>
          <Text className="text-primary font-bold text-2xl">
            ₹ {grandTotal.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default OrderSummeryFooter;
