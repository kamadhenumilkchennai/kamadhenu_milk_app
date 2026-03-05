import { Product, ProductVariant } from "@/assets/data/types";
import { supabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/* ---------------- PRODUCT LIST ---------------- */

export const useProductList = () => {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw new Error(error.message);

      return (data ?? []).map((p) => ({
        ...p,
        variants: (p.variants ?? []) as ProductVariant[],
      }));
    },
  });
};

/* ---------------- SINGLE PRODUCT ---------------- */

export const useProduct = (id: number) => {
  return useQuery<Product>({
    queryKey: ["products", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw new Error(error.message);

      return {
        ...data,
        variants: (data.variants ?? []) as ProductVariant[],
      };
    },
  });
};

/* ---------------- INSERT PRODUCT ---------------- */

export const useInsertProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      image?: string | null;
      description?: string | null;
      variants: ProductVariant[];
    }) => {
      const { data: product, error } = await supabase
        .from("products")
        .insert({
          name: data.name,
          image: data.image,
          description: data.description,
          variants: data.variants,
          price: null, // legacy column
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

/* ---------------- UPDATE PRODUCT ---------------- */

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: number;
      name: string;
      image?: string | null;
      description?: string | null;
      variants: ProductVariant[];
    }) => {
      const { data: product, error } = await supabase
        .from("products")
        .update({
          name: data.name,
          image: data.image,
          description: data.description,
          variants: data.variants,
        })
        .eq("id", data.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return product;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", id] });
    },
  });
};

/* ---------------- DELETE PRODUCT ---------------- */

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
