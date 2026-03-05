import { InsertTables, Tables } from "@/assets/data/types";
import { supabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Address = Tables<"addresses">;
export type InsertAddress = InsertTables<"addresses">;


/* ----------------------------------
   FETCH USER ADDRESSES (NOT DELETED)
----------------------------------- */

export const useUserAddresses = (userId?: string, enabled = true) => {
  return useQuery({
    queryKey: ["addresses", userId],
    enabled: !!userId && enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId!)
        .eq("deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);

      return data as Address[];
    },
  });
};

/* ----------------------------------
   DELETE ADDRESS (SMART DELETE)
----------------------------------- */

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId: number) => {
      // 1️⃣ Check if address is linked with any order
      const { data: orders, error: orderError } = await supabase
        .from("orders")
        .select("id")
        .eq("address_id", addressId)
        .limit(1);

      if (orderError) throw new Error(orderError.message);

      if (orders && orders.length > 0) {
        // 2️⃣ SOFT DELETE
        const { error } = await supabase
          .from("addresses")
          .update({ deleted: true })
          .eq("id", addressId);

        if (error) throw new Error(error.message);
      } else {
        // 3️⃣ HARD DELETE
        const { error } = await supabase
          .from("addresses")
          .delete()
          .eq("id", addressId);

        if (error) throw new Error(error.message);
      }
    },

    onSuccess: (_, addressId) => {
      // 🔥 Refresh address list everywhere
      queryClient.invalidateQueries({ queryKey: ["addresses"] });

      // Optional: also refresh orders if needed
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useInsertAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: InsertAddress) => {
      const { data, error } = await supabase
        .from("addresses")
        .insert(payload)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};