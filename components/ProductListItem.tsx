import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlistStatus,
} from "@/api/wishlist";
import { ProductVariant, Tables } from "@/assets/data/types";
import { useAuth } from "@/providers/AuthProvider";

import { Ionicons } from "@expo/vector-icons";
import { Link, useSegments } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RemoteImage from "./RemoteImage";
import { defaultImage } from "@/utils/branding";


type ProductListItemProps = {
  product: Tables<"products"> & { variants: ProductVariant[] };
};

export default function ProductListItem({ product }: ProductListItemProps) {
  const segments = useSegments();
  const { session } = useAuth();
  const userId = session?.user.id;

  const { data, isLoading } = useWishlistStatus(userId, product.id);
  const addToWishlist = useAddToWishlist(userId);
  const removeFromWishlist = useRemoveFromWishlist(userId);

  const toggleWishlist = () => {
    if (!userId || isLoading) return;

    if (data?.isWishlisted && data.wishlistRowId) {
      removeFromWishlist.mutate(data.wishlistRowId);
    } else {
      addToWishlist.mutate(product.id);
    }
  };

  return (
    <Link href={`/${segments[0]}/menu/${product.id}`} asChild>
      <Pressable
        className="rounded-2xl overflow-hidden mb-3 mt-2 bg-background-subtle"
        style={{ width: "48%" }}
      >
        <View className="relative">
          <RemoteImage
            path={product.image ?? undefined}
            fallback={defaultImage}
            resizeMode="cover"
            className="w-full h-44 bg-background-subtle"
          />

          {/* ❤️ WISHLIST */}
          <TouchableOpacity
            className="absolute top-3 right-3 bg-black/30 p-2 rounded-full"
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation();
              toggleWishlist();
            }}
          >
            {isLoading ||
            addToWishlist.isPending ||
            removeFromWishlist.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons
                name={data?.isWishlisted ? "heart" : "heart-outline"}
                size={18}
                color={data?.isWishlisted ? "#EF4444" : "#fff"}
              />
            )}
          </TouchableOpacity>
        </View>

        <View className="p-3">
          <Text
            className="text-text-primary font-bold text-lg"
            numberOfLines={2}
          >
            {product.name}
          </Text>
          {/* Variants */}
          <View className="mt-2">
            {product.variants.map((variant) => (
              <View
                key={variant.label}
                className="flex-row items-center gap-2 rounded-full"
              >
                <Text className="text-text-primary text-sm">
                  {variant.label}
                </Text>
                <Text className="text-text-primary font-semibold text-sm">
                  ₹ {variant.price.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
