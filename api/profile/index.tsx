import { InsertTables, Tables, UpdateTables } from "@/assets/data/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { decode } from "base64-arraybuffer";
import { randomUUID } from "expo-crypto";
import * as FileSystem from "expo-file-system/legacy";

/* ---------------- FETCH PROFILE ---------------- */

export const useMyProfile = () => {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    },
  });
};

/* ---------------- AVATAR SIGNED URL ---------------- */

export const getAvatarSignedUrl = async (path: string) => {
  const { data, error } = await supabase.storage
    .from("avatars")
    .createSignedUrl(path, 60 * 60);

  if (error) throw error;
  return data.signedUrl;
};

/* ---------------- AVATAR UPLOAD ---------------- */

export const uploadAvatar = async (
  fileUri: string,
  userId: string
): Promise<string> => {
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: "base64",
  });

  const filePath = `${userId}/${randomUUID()}.png`;

  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(filePath, decode(base64), {
      contentType: "image/png",
      upsert: true,
    });

  if (error) throw error;
  return data.path;
};

/* ---------------- UPDATE PROFILE ---------------- */

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: async (payload: UpdateTables<"profiles">) => {
      if (!userId) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

/* ---------------- CREATE PROFILE (OPTIONAL) ---------------- */

export const useCreateProfile = () => {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: async (newData: InsertTables<"profiles">) => {
      if (!userId) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .insert({ ...newData, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async (): Promise<Tables<"profiles">[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });
};