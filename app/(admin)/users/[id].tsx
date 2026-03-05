import { useAdminOrdersByUser } from "@/api/orders";
import { useAdminUpdateUser } from "@/api/profile/admin";
import { Tables } from "@/assets/data/types";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Link, useLocalSearchParams, useSegments } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

export default function AdminUserDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  /* ---------------- FETCH USER ---------------- */
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ["admin-user", id],
    enabled: !!id,
    queryFn: async (): Promise<Tables<"profiles">> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  /* ---------------- FETCH USER ORDERS ---------------- */
  const { data: orders, isLoading: ordersLoading } = useAdminOrdersByUser(id);
  const { mutate: updateUser, isPending } = useAdminUpdateUser();
  const segments = useSegments();

  /* ---------------- LOADING ---------------- */
  if (userLoading || ordersLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-3 text-gray-500">Loading user details…</Text>
      </View>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (userError || !user) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">Failed to load user</Text>
      </View>
    );
  }
  const isActive = user.is_active ?? true;

  /* ---------------- UI ---------------- */
  return (
    <View className="flex-1 bg-background p-4">
      {/* USER INFO */}
      <View className="rounded-3xl p-5 bg-black/5 mb-4">
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mr-3">
            <Text className="text-primary text-xl">👤</Text>
          </View>

          <View>
            <Text className="text-text-primary font-bold text-lg">
              {user.full_name ?? "Unnamed User"}
            </Text>

            {user.username && (
              <Text className="text-text-secondary text-sm">
                @{user.username}
              </Text>
            )}
          </View>
        </View>

        {/* Details */}
        <View className="ml-15 gap-1">
          {user.phone && (
            <Text className="text-text-secondary text-sm">📞 {user.phone}</Text>
          )}

          <Text className="text-xs text-gray-400 mt-1">ID: {user.id}</Text>

          <Text className="text-xs text-green-400 font-bold mt-1">
            Group: {user.group}
          </Text>
        </View>
      </View>

      {/* USER MANAGEMENT */}
      <View className="rounded-3xl p-5 bg-black/5 mb-6">
        {/* STATUS */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold mb-4">User Management</Text>

          <Pressable
            disabled={isPending}
            onPress={() =>
              updateUser({
                userId: user.id,
                updates: { is_active: !isActive },
              })
            }
            className={`px-4 py-2 rounded-full ${
              isActive ? "bg-green-600" : "bg-red-500"
            }`}
          >
            <Text className="text-white font-semibold">
              {isPending ? "Saving..." : isActive ? "Active" : "Inactive"}
            </Text>
          </Pressable>
        </View>

        {/* GROUP */}
        <View className="flex-row justify-between items-center">
          <Text className="text-text-primary mb-2">Group</Text>
          <View className="flex-row gap-3">
            {["USER", "DELIVERY"].map((grp) => (
              <Pressable
                key={grp}
                disabled={isPending}
                onPress={() =>
                  updateUser({
                    userId: user.id,
                    updates: { group: grp },
                  })
                }
                className={`px-4 py-2 rounded-full border ${
                  user.group === grp
                    ? "bg-indigo-500 border-indigo-500"
                    : "border-gray-300 bg-white"
                }`}
              >
                <Text
                  className={
                    user.group === grp
                      ? "text-white font-semibold"
                      : "text-gray-700"
                  }
                >
                  {grp}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* ORDERS */}
      <Text className="text-lg font-bold mb-3">Orders</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ gap: 12, paddingBottom: 120 }}
        ListEmptyComponent={
          <Text className="text-gray-500 mt-6 text-center">
            No orders found
          </Text>
        }
        renderItem={({ item }) => (
          <Link href={`/${segments[0]}/orders/${item.id}`} asChild>
            <Pressable>
              <View className="rounded-3xl p-5 bg-black/5">
                <View className="flex-row justify-between items-center">
                  <Text className="font-semibold text-text-primary">
                    Order #{item.id}
                  </Text>

                  <Text className="text-xs px-3 py-1 rounded-full bg-gray-200 text-gray-700">
                    {item.status}
                  </Text>
                </View>

                <Text className="mt-2 text-text-secondary">
                  Total: ₹{item.total}
                </Text>

                {item.subscription && (
                  <Text className="text-xs text-indigo-500 mt-1">
                    Subscription: {item.subscription.plan_type}
                  </Text>
                )}

                <Text className="text-xs text-gray-400 mt-1">
                  {dayjs(item.created_at).fromNow()}{" "}
                  <Text className="opacity-60">
                    ({dayjs(item.created_at).format("DD MMM YYYY")})
                  </Text>
                </Text>
              </View>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}
