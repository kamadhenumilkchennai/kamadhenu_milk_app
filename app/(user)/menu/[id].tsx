import { useProduct } from "@/api/products";
import OverlayHeader from "@/components/OverlayHeader";
import RemoteImage from "@/components/RemoteImage";
import { useCart } from "@/providers/CartProvider";
import { defaultImage } from "@/utils/branding";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProductDetailsScreen() {
  const { id: isString } = useLocalSearchParams();
  const id = Number(typeof isString === "string" ? isString : isString?.[0]);

  const { data: product, error, isLoading } = useProduct(id);
  const { addItem } = useCart();
  const router = useRouter();

  const [selectedVariantLabel, setSelectedVariantLabel] = useState<string>();

  // Automatically select the first variant when product data loads
  useEffect(() => {
    if (product?.variants?.length && !selectedVariantLabel) {
      setSelectedVariantLabel(product.variants[0].label);
    }
  }, [product, selectedVariantLabel]);

  const selectedVariant = useMemo(() => {
    return product?.variants.find((v) => v.label === selectedVariantLabel);
  }, [product, selectedVariantLabel]);

  const [quantity, setQuantity] = useState(1);

  const addToCart = () => {
    if (!product || !selectedVariant) return;
    addItem(product, selectedVariant, quantity);
    router.push("/(user)/cart");
  };

  if (isLoading) return <ActivityIndicator className="mt-10" />;
  if (error) return <Text className="text-red-500">{error.message}</Text>;
  if (!product) return <Text>Product not found</Text>;

  return (
    <View className="flex-1 bg-background">
      <OverlayHeader />

      <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
        {/* IMAGE */}
        <RemoteImage
          path={product.image ?? undefined}
          fallback={defaultImage}
          className="w-full h-96"
        />

        {/* CONTENT */}
        <View className="p-6">
          <Text className="text-3xl font-bold mb-4">{product.name}</Text>

          {/* VARIANT SELECT */}
          <Text className="font-semibold mb-2">Select variant</Text>

          <View className="flex-row gap-3 mb-6">
            {product.variants.map((variant) => {
              const isSelected = selectedVariantLabel === variant.label;
              return (
                <Pressable
                  key={variant.label}
                  onPress={() => setSelectedVariantLabel(variant.label)}
                  className={`px-4 py-2 rounded-full ${
                    isSelected ? "bg-primary" : "bg-background-subtle"
                  }`}
                >
                  <Text className={isSelected ? "text-white" : ""}>
                    {variant.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* QUANTITY */}
          <Text className="font-semibold mb-2">Quantity</Text>

          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 rounded-full bg-background-subtle items-center justify-center"
            >
              <Ionicons name="remove" size={22} />
            </TouchableOpacity>

            <Text className="mx-6 text-xl font-bold">{quantity}</Text>

            <TouchableOpacity
              onPress={() => setQuantity(quantity + 1)}
              className="w-12 h-12 rounded-full bg-primary items-center justify-center"
            >
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* DESCRIPTION */}
          {product.description && (
            <View>
              <Text className="font-semibold mb-2">Description</Text>
              <View className=" mb-6">
                {product.description.split("\n").map((line, index) => (
                  <Text
                    key={`${product.id}-desc-${index}`}
                    className="text-text-secondary"
                  >
                    {line}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View className="absolute bottom-20 left-0 right-0 bg-background px-6 py-4 border-t border-background-subtle">
        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className="text-sm">Total</Text>
            <Text className="text-2xl font-bold">
              ₹{" "}
              {selectedVariant
                ? (selectedVariant.price * quantity).toFixed(2)
                : "0.00"}
            </Text>
          </View>

          <TouchableOpacity
            disabled={!selectedVariant}
            onPress={addToCart}
            className={`px-5 py-3 rounded-full flex-row items-center ${
              selectedVariant ? "bg-primary" : "bg-gray-400"
            }`}
          >
            <Ionicons name="cart" size={22} color="#fff" />
            <Text className="ml-2 font-bold text-white">Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
