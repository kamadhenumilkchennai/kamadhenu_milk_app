import { useMyOrderList } from "@/api/orders";
import EmptyState from "@/components/EmptyState";
import GradientHeader from "@/components/GradientHeader";
import OrderListItem from "@/components/OrderListItem";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type FilterKey = "all" | "completed" | "active";

// Status categories
const COMPLETED_STATUSES = ["Delivered"];
const ACTIVE_STATUSES = ["New", "Delivering", "Cancelled"];

export default function OrdersScreen() {
  const { data: orders, isLoading, error } = useMyOrderList();
  const [filter, setFilter] = useState<FilterKey>("all");

  /* ---------------- FILTER LOGIC ---------------- */
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter((order) => {
      const status = order.status?.trim() ?? "";

      if (filter === "completed") return COMPLETED_STATUSES.includes(status);
      if (filter === "active") return ACTIVE_STATUSES.includes(status);
      return true; // all
    });
  }, [orders, filter]);

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#43ce4e" />
        <Text className="mt-3 text-text-secondary">Loading orders...</Text>
      </View>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-text-primary font-semibold text-xl mt-4">
          Failed to load orders
        </Text>
        <Text className="text-text-secondary text-center mt-2">
          Please try again later
        </Text>
      </View>
    );
  }

  /* ---------------- EMPTY STATE ---------------- */
  if (!orders || orders.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <GradientHeader title="Orders" />
        <View className="flex-1">
          <EmptyState
            icon="receipt-outline"
            title="No orders yet"
            description="Your order history will appear here"
            actionLabel="Start Shopping"
            actionHref="/(user)/menu"
          />
        </View>
      </View>
    );
  }

  /* ---------------- MAIN RENDER ---------------- */
  return (
    <View className="flex-1 bg-white">
      <GradientHeader title="Orders" />

      {/* ---------------- FILTER BUTTONS ---------------- */}
      <View className="flex-row justify-around mx-4 my-4 bg-gray-100 rounded-full p-2">
        <FilterButton
          label="All"
          isActive={filter === "all"}
          onPress={() => setFilter("all")}
        />
        <FilterButton
          label="Completed"
          isActive={filter === "completed"}
          onPress={() => setFilter("completed")}
        />
        <FilterButton
          label="Active"
          isActive={filter === "active"}
          onPress={() => setFilter("active")}
        />
      </View>

      {/* ---------------- ORDERS LIST ---------------- */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <OrderListItem order={item} />}
        contentContainerStyle={{
          paddingBottom: 120,
          gap: 12,
          paddingHorizontal: 16,
        }}
      />

      {/* ---------------- EMPTY STATE FOR FILTERED LIST ---------------- */}
      {filteredOrders.length === 0 && (
        <View className="flex-1 justify-center items-center mt-10">
          <Text className="text-gray-500 text-lg">No orders found</Text>
        </View>
      )}
    </View>
  );
}

/* ---------------- SINGLE FILTER BUTTON ---------------- */

function FilterButton({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: 9999,
        backgroundColor: isActive ? "white" : "transparent",
        shadowColor: isActive ? "#000" : "transparent",
        shadowOpacity: isActive ? 0.1 : 0,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 2,
      }}
    >
      <Text
        style={{ fontWeight: "600", color: isActive ? "#43ce4e" : "#6b7280" }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
