import { useProduct } from "@/api/products";
import RemoteImage from "@/components/RemoteImage";
import Colors from "@/constants/Colors";
import { defaultImage } from "@/utils/branding";
import { FontAwesome } from "@expo/vector-icons";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function ProductDetailsScreen() {
  const { id: isString } = useLocalSearchParams();
  const id = Number(typeof isString === "string" ? isString : isString?.[0]);

  const { data: product, error, isLoading } = useProduct(id);

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator />
      </View>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Text className="text-red-500">{error.message}</Text>
      </View>
    );
  }

  /* ---------------- NOT FOUND ---------------- */
  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Product not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-bleck/5 px-4"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen
        options={{
          title: "Menu",
          headerRight: () => (
            <Link href={`/(admin)/menu/create?id=${id}`} asChild>
              <Pressable className="mr-4">
                <FontAwesome
                  name="pencil"
                  size={22}
                  color={Colors.light.tint}
                />
              </Pressable>
            </Link>
          ),
        }}
      />

      {/* IMAGE */}
      <View className="mt-4 rounded-3xl overflow-hidden bg-gray-100">
        <RemoteImage
          path={product.image ?? undefined}
          fallback={defaultImage}
          className="w-full aspect-square"
        />
      </View>

      {/* DETAILS CARD */}
      <View className="mt-6 bg-white rounded-3xl p-5 shadow-sm">
        <Text className="text-2xl font-bold">{product.name}</Text>

        {/* VARIANTS */}
        <View className="mt-4">
          <Text className="text-lg font-semibold mb-2">Variants</Text>

          {product.variants.map((v) => (
            <View
              key={v.label}
              className="flex-row justify-between py-2 border-b border-gray-200"
            >
              <Text className="text-base">{v.label}</Text>
              <Text className="text-base font-bold">₹ {v.price}</Text>
            </View>
          ))}
        </View>

        {/* DESCRIPTION */}
        {!!product.description && (
          <View className="mt-6">
            <Text className="text-lg font-semibold mb-2">Description</Text>

            <View className="gap-2">
              {product.description
                .split("\n")
                .filter(Boolean)
                .map((line, index) => (
                  <Text
                    key={`${product.id}-desc-${index}`}
                    className="text-base text-gray-600"
                  >
                    {line}
                  </Text>
                ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
