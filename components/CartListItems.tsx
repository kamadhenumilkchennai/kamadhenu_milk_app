import { CartItem } from "@/assets/data/types";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import { useCart } from "../providers/CartProvider";
import { defaultImage } from "@/utils/branding";
import RemoteImage from "./RemoteImage";

type CartListItemProps = {
  cartItem: CartItem;
};

const CartListItem = ({ cartItem }: CartListItemProps) => {
  const { updateQuantity, removeItem } = useCart();
  const [modalVisible, setModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Use variant price, fallback to 0
  const price = cartItem.size?.price ?? 0;
  const itemTotal = price * cartItem.quantity;

  const handleMinus = () => {
    if (cartItem.quantity === 1) {
      setModalVisible(true);
      return;
    }
    setIsUpdating(true);
    updateQuantity(cartItem.id, -1);
    setIsUpdating(false);
  };

  const handlePlus = () => {
    setIsUpdating(true);
    updateQuantity(cartItem.id, 1);
    setIsUpdating(false);
  };

  const handleRemove = () => {
    removeItem(cartItem.id);
    setModalVisible(false);
  };

  return (
    <>
      {/* Card */}
      <View className="bg-black/5 rounded-3xl ">
        <View className="p-4 flex-row">
          {/* Image */}
          <View className="relative">
            <RemoteImage
              path={cartItem.product.image ?? undefined}
              fallback={defaultImage}
              resizeMode="cover"
              className="w-32 h-32 rounded-2xl bg-surface-elevated"
            />

            {/* Quantity Badge */}
            <View className="absolute top-2 right-2 bg-primary rounded-full px-2 py-0.5">
              <Text className="text-inverse text-xs font-bold">
                ×{cartItem.quantity}
              </Text>
            </View>
          </View>

          {/* Details */}
          <View className="flex-1 ml-4 justify-between">
            <View>
              <Text
                className="text-text-primary font-bold text-lg leading-tight"
                numberOfLines={2}
              >
                {cartItem.product.name}
              </Text>

              <View className="flex-row items-center mt-2">
                <Text className="text-primary font-bold text-2xl">
                  ₹ {itemTotal.toFixed(2)}
                </Text>
                <Text className="text-text-secondary text-sm ml-2">
                  ₹ {price.toFixed(2)} each
                </Text>
              </View>

              <Text className="text-text-primary font-bold text-lg leading-tight">
                {cartItem.size?.label}
              </Text>
            </View>

            {/* Actions */}
            <View className="flex-row items-center mt-3">
              {/* Minus */}
              <Pressable
                onPress={handleMinus}
                className="bg-surface-elevated rounded-full w-9 h-9 items-center justify-center"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Ionicons name="remove" size={18} color="#111827" />
                )}
              </Pressable>

              {/* Quantity */}
              <View className="mx-4 min-w-[32px] items-center">
                <Text className="text-text-primary font-bold text-lg">
                  {cartItem.quantity}
                </Text>
              </View>

              {/* Plus */}
              <Pressable
                onPress={handlePlus}
                className="bg-primary rounded-full w-9 h-9 items-center justify-center"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#121212" />
                ) : (
                  <Ionicons name="add" size={18} color="#121212" />
                )}
              </Pressable>

              {/* Trash */}
              <Pressable
                onPress={() => setModalVisible(true)}
                className="ml-auto bg-accent-error/10 rounded-full w-9 h-9 items-center justify-center"
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* Remove Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/40 p-4">
          <View className="bg-background rounded-2xl p-5 w-full max-w-md">
            <Text className="text-text-primary text-lg font-bold mb-3">
              Remove Item?
            </Text>

            <Text className="text-text-secondary mb-4">
              Remove{" "}
              <Text className="font-semibold">{cartItem.product.name}</Text>{" "}
              from cart?
            </Text>

            <View className="flex-row justify-end gap-3">
              <Pressable
                onPress={() => setModalVisible(false)}
                className="px-4 py-2 rounded-xl border border-surface-border"
              >
                <Text className="text-text-secondary">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleRemove}
                className="px-4 py-2 rounded-xl bg-accent-error flex-row items-center"
              >
                <AntDesign name="delete" size={16} color="#fff" />
                <Text className="text-inverse ml-2">Remove</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default CartListItem;
