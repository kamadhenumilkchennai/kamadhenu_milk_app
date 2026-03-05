import { useRemoveFromWishlist, useWishlist } from "@/api/wishlist";
import { Product, ProductVariant } from "@/assets/data/types";
import EmptyState from "@/components/EmptyState";
import GradientHeader from "@/components/GradientHeader";
import { defaultImage } from "@/utils/branding";
import RemoteImage from "@/components/RemoteImage";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/providers/CartProvider";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/* ---------------- SCREEN ---------------- */

export default function WishlistScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { addItem } = useCart();

  const userId = session?.user.id;

  const { data: wishlist = [], isLoading } = useWishlist(userId);
  const { mutate: removeItem, isPending } = useRemoveFromWishlist(userId);

  /* ---------------- ACTIONS ---------------- */

  const handleRemove = (id: number, name: string) => {
    Alert.alert("Remove item", `Remove ${name} from wishlist?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeItem(id),
      },
    ]);
  };

  const addToCart = (product: Product) => {
    // Safely pick first variant or default
    const selectedVariant: ProductVariant = product.variants?.[0];

    addItem(product, selectedVariant, 1);
    router.push("/(user)/cart");
  };

  /* ---------------- LOADING ---------------- */

  if (isLoading) {
    return <ActivityIndicator className="mt-10" />;
  }

  /* ---------------- UI ---------------- */

  return (
    <View className="flex-1 bg-background">
      <GradientHeader title="Wishlist" />

      {wishlist.length === 0 ? (
         <EmptyState
          icon="heart-outline"
          title="Your wishlist is empty"
          description="Start adding products you love"
          actionLabel="Go to Menu"
          actionHref="/(user)/menu"
        />
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingTop: 10,
            paddingBottom: 120,
            gap: 16,
          }}
        >
          <View className="px-6 space-y-4">
            {wishlist.map((item) => {
              const product: Product = item.products;

              // Safely get first variant for display
              const displayVariant: ProductVariant =
                product.variants?.[0] ?? { label: "M", price: 0 };

              return (
                <View
                  key={item.id}
                  className="bg-background-subtle rounded-3xl p-4 mb-4"
                >
                  {/* PRODUCT */}
                  <View className="flex-row">
                    <RemoteImage
                      path={product.image ?? undefined}
                      fallback={defaultImage}
                      className="w-24 h-24 rounded-xl bg-surface-elevated"
                    />

                    <View className="flex-1 ml-4">
                      <Text
                        className="text-text-primary font-bold text-base"
                        numberOfLines={2}
                      >
                        {product.name}
                      </Text>

                      <Text className="text-primary font-bold text-lg mt-1">
                        ₹ {displayVariant.price}
                      </Text>

                      <Text className="text-text-secondary text-sm mt-1">
                        Size: {displayVariant.label}
                      </Text>
                    </View>

                    {/* REMOVE */}
                    <TouchableOpacity
                      onPress={() => handleRemove(item.id, product.name)}
                      disabled={isPending}
                      className="p-2"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={22}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* ADD TO CART */}
                  <TouchableOpacity
                    onPress={() => addToCart(product)}
                    activeOpacity={0.85}
                    className="mt-4 rounded-full py-4 flex-row items-center justify-center bg-primary"
                  >
                    <Ionicons name="cart" size={22} color="#121212" />
                    <Text className="ml-2 font-bold text-base text-inverse">
                      Add to Cart
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
