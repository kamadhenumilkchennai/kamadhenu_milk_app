import { InsertTables, Tables, UpdateTables } from "@/assets/data/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

/* ---------------- TYPES ---------------- */

export type OrdersInsert = InsertTables<"orders">;
export type BaseOrder = Tables<"orders"> & {
  addresses?: Tables<"addresses"> | null;
};
export type AdminOrder = Tables<"orders"> & {
  subscription:
    | (Tables<"subscriptions"> & {
        subscription_pauses: Tables<"subscription_pauses">[];
      })
    | null;
};

export type OrderWithItems = Tables<"orders"> & {
  order_items: (Tables<"order_items"> & {
    products: Tables<"products">;
  })[];

  addresses: Tables<"addresses"> | null;

  subscription: Tables<"subscriptions"> | null;
};

/* ---------------- ADMIN ORDERS ---------------- */

export const useAdminOrderList = ({ statuses }: { statuses?: string[] }) => {
  return useQuery<AdminOrder[], Error>({
    queryKey: ["admin-orders", { statuses }],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select(
          `
          *,
          subscription:subscriptions (
            *,
            subscription_pauses (*)
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (statuses?.length) {
        query = query.in("status", statuses);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      return data ?? [];
    },
  });
};

/* ---------------- USER ORDERS LIST ---------------- */

export const useMyOrderList = () => {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery<OrderWithItems[], Error>({
    queryKey: ["orders", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            products (*)
          ),
          subscription:subscriptions (*)
        `,
        )
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data as OrderWithItems[];
    },
  });
};

/* ---------------- ORDER DETAILS ---------------- */

export const useOrderDetails = (
  orderId: number,
  options?: Omit<
    UseQueryOptions<OrderWithItems, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<OrderWithItems, Error>({
    queryKey: ["order", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          addresses (*),
          profiles (*),
          order_items (
            *,
            products (*)
          ),
          subscription:subscriptions (*)
        `,
        )
        .eq("id", orderId)
        .single();

      if (error) throw new Error(error.message);
      return data as OrderWithItems;
    },
    ...options,
  });
};

/* ---------------- UPDATE ORDER ---------------- */

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updatedFields,
    }: {
      id: number;
      updatedFields: UpdateTables<"orders">;
    }) => {
      const { data, error } = await supabase
        .from("orders")
        .update(updatedFields)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", id] });
    },
  });
};

/* ---------------- INSERT ORDER ---------------- */

export const useInsertOrder = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: OrdersInsert) => {
      if (!session?.user.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("orders")
        .insert({
          ...order,
          user_id: session.user.id,
          status: "New",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

/* ---------------- CANCEL ORDER ---------------- */

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId }: { orderId: number }) => {
      const { data, error } = await supabase
        .from("orders")
        .update({
          status: "Cancelled",
          status_updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("status", "New") // 🔐 safety check
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },

    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
  });
};

/* ---------------- ADMIN: ORDERS BY USER ---------------- */

export const useAdminOrdersByUser = (userId?: string) => {
  return useQuery<AdminOrder[], Error>({
    queryKey: ["admin-orders", "user", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          subscription:subscriptions (
            *,
            subscription_pauses (*)
          )
        `,
        )
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
};
