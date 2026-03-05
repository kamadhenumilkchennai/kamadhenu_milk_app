import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type InsertOrderItem = {
  order_id: number;
  product_id: number;
  quantity: number;
  variant_label: string;
  variant_price: number;
};

export const useInsertOrderItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: InsertOrderItem[]) => {
      const { error } = await supabase
        .from("order_items")
        .insert(items);

      if (error) throw new Error(error.message);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
