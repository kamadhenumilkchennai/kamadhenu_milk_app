import { Tables } from "@/assets/data/types";
import { useSegments } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { defaultImage } from "@/utils/branding";
import RemoteImage from "./RemoteImage";

type OrderItemListItemProps = {
  items: (Tables<"order_items"> & {
    products?: Tables<"products"> | null;
  })[];
};

const OrderItemListDelivery = ({ items }: OrderItemListItemProps) => {
  const segments = useSegments();

  return (
    <View className="bg-background-card rounded-3xl p-5 bg-black/5">
      {items.map((item, index) => {
        const product = item.products;

        return (
          <View key={item.id}>
            <View className="flex-row items-center">
              {/* Product Image */}
              <View className="relative">
                <Pressable>
                  <RemoteImage
                    path={product?.image ?? undefined}
                    fallback={defaultImage}
                    resizeMode="cover"
                    className="w-24 h-24 rounded-2xl bg-surface-muted"
                  />
                </Pressable>

                {/* Quantity badge */}
                <View className="absolute top-2 right-2 bg-primary rounded-full px-2 py-0.5">
                  <Text className="text-white text-xs font-bold">
                    ×{item.quantity}
                  </Text>
                </View>
              </View>

              <View className="flex-1 ml-4 justify-between">
                {/* Product Name */}
                <View>
                  <Pressable>
                    <Text
                      className="text-text-primary font-bold text-lg"
                      numberOfLines={2}
                    >
                      {product?.name ?? "Unknown Product"}
                    </Text>
                  </Pressable>

                  {/* Price + Size */}
                  <View className="mt-2">
                    <Text className="text-text-secondary font-bold text-base">
                      ₹ {item.variant_price ?? 0}
                    </Text>
                    <Text className="text-gray-500 dark:text-neutral-400 text-sm">
                      Size:{" "}
                      <Text className="text-primary font-bold">
                        {item.variant_label ?? "-"}
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mx-5">
                <Text className="text-gray-500 dark:text-neutral-400 text-lg">
                  Qty: {item.quantity}
                </Text>
                <Text className="text-gray-500 dark:text-neutral-400 text-sm">
                  Total amt:{" "}
                  <Text className="text-lg text-primary font-bold">
                    ₹ {((item.variant_price ?? 0) * item.quantity).toFixed(2)}
                  </Text>
                </Text>
              </View>
            </View>

            {/* Divider except last item */}
            {index !== items.length - 1 && (
              <View className="border-t border-black/5 my-3" />
            )}
          </View>
        );
      })}
    </View>
  );
};

export default OrderItemListDelivery;
