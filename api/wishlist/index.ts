import { Product, ProductVariant, Tables } from "@/assets/data/types";
import { supabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/* ---------------- TYPES ---------------- */

export type WishlistItem = Tables<"wishlist"> & {
  products: Product;
};

// Supabase returns a slightly different shape where product.variants is JSON
type RawWishlistRow = Omit<Tables<"wishlist">, "products"> & {
  products: {
    id: number;
    name: string;
    image: string | null;
    variants: unknown; // JSON from DB
    created_at?: string;
    description?: string | null;
  };
};

/* ---------------- LIST ---------------- */

export const useWishlist = (userId?: string) => {
  return useQuery({
    queryKey: ["wishlist", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlist")
        .select(
          `
          id,
          product_id,
          user_id,
          created_at,
          products (
            id,
            name,
            image,
            variants
          )
        `,
        )
        .eq("user_id", userId!);

      if (error) throw error;

      // Map variants from JSON to typed ProductVariant[]
      return (data ?? []).map((row: RawWishlistRow) => {
        const products: Product = {
          id: row.products.id,
          name: row.products.name,
          image: row.products.image,
          created_at: row.products.created_at ?? "",
          description: row.products.description ?? null,
          variants: (row.products.variants ?? []) as ProductVariant[],
        };

        return {
          ...row,
          products,
        } as WishlistItem;
      });
    },
  });
};

/* ---------------- CHECK STATUS ---------------- */

export const useWishlistStatus = (userId?: string, productId?: number) => {
  return useQuery({
    queryKey: ["wishlist-status", userId, productId],
    enabled: !!userId && !!productId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", userId!)
        .eq("product_id", productId!)
        .maybeSingle();

      if (error) throw error;

      return {
        isWishlisted: !!data,
        wishlistRowId: data?.id ?? null,
      };
    },
  });
};

/* ---------------- ADD ---------------- */

export const useAddToWishlist = (userId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: number) => {
      const { data, error } = await supabase
        .from("wishlist")
        .insert({
          user_id: userId!,
          product_id: productId,
        })
        .select("id")
        .single();

      if (error) throw error;
      return data;
    },

    onSuccess(_, productId) {
      queryClient.invalidateQueries({
        queryKey: ["wishlist-status", userId, productId],
      });
      queryClient.invalidateQueries({
        queryKey: ["wishlist", userId],
      });
    },
  });
};

/* ---------------- REMOVE ---------------- */

export const useRemoveFromWishlist = (userId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (wishlistId: number) => {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("id", wishlistId);

      if (error) throw error;
      return wishlistId;
    },

    onSuccess(_, wishlistId) {
      queryClient.invalidateQueries({ queryKey: ["wishlist", userId] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-status"] });
    },
  });
};
