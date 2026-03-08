import { Tables } from "@/assets/data/types";
import logger from "@/lib/logger";
import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type UpdateUserInput = {
  userId: string;
  updates: Partial<Tables<"profiles">>;
};

export function useAdminUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, updates }: UpdateUserInput) => {
      // Log only non-sensitive metadata
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const meta = { userId, keys: Object.keys(updates || {}) };
      logger.log("Admin update", meta);

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select("*"); // ❗️NO .single()

      if (error) {
        logger.error("Admin update failed", error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error("Update blocked by RLS or user not found");
      }

      return data[0];
    },

    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["admin-user", updatedUser.id], updatedUser);
    },
  });
}
