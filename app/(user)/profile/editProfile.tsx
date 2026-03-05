import {
  getAvatarSignedUrl,
  uploadAvatar,
  useMyProfile,
  useUpdateProfile,
} from "@/api/profile";
import GradientHeader from "@/components/GradientHeader";
import { useAuth } from "@/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/* ---------------- REGEX ---------------- */
const phoneRegex = /^[0-9]{10}$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
const websiteRegex =
  /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/;

const defaultAvatar = require("@/assets/images/user-avatar.png");

/* ---------------- HELPERS ---------------- */
function generateUsername(fullName: string) {
  return fullName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_") // replace spaces with _
    .replace(/[^a-z0-9_]/g, "") // remove invalid characters
    .slice(0, 20); // max 20 chars
}

/* ---------------- LABEL COMPONENT ---------------- */
const InputLabel = ({ children }: { children: string }) => (
  <Text className="ml-2 mt-2 mb-2 text-lg text-text-secondary font-medium">
    {children}
  </Text>
);

/* ---------------- COMPONENT ---------------- */
export default function EditProfile() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id ?? "";

  const { data: profile, isLoading } = useMyProfile();
  const { mutateAsync: updateProfile } = useUpdateProfile();

  const [saving, setSaving] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isUsernameEdited, setIsUsernameEdited] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    username: "",
    phone: "",
    website: "",
    avatar_url: null as string | null,
  });

  /* ---------------- INIT FORM ---------------- */
  useEffect(() => {
    if (!profile) return;

    setForm({
      full_name: profile.full_name ?? "",
      username: profile.username ?? "",
      phone: profile.phone ?? "",
      website: profile.website ?? "",
      avatar_url: profile.avatar_url ?? null,
    });
  }, [profile]);

  /* ---------------- AVATAR PREVIEW ---------------- */
  useEffect(() => {
    if (!form.avatar_url) {
      setAvatarUri(null);
      return;
    }

    if (form.avatar_url.startsWith("file://")) {
      setAvatarUri(form.avatar_url);
      return;
    }

    getAvatarSignedUrl(form.avatar_url).then(setAvatarUri);
  }, [form.avatar_url]);

  /* ---------------- USERNAME AUTO-GENERATION ---------------- */
  useEffect(() => {
    if (!isUsernameEdited && form.full_name) {
      setForm((p) => ({ ...p, username: generateUsername(p.full_name) }));
    }
  }, [form.full_name, isUsernameEdited]);

  /* ---------------- VALIDATION ---------------- */
  const errors = useMemo(() => {
    return {
      full_name:
        form.full_name.trim().length === 0
          ? "Full name is required"
          : null,

      username:
        form.username && !usernameRegex.test(form.username)
          ? "Username must be 3–20 characters (letters, numbers, _)"
          : null,

      phone:
        form.phone && !phoneRegex.test(form.phone)
          ? "Phone number must be 10 digits"
          : null,

      website:
        form.website && !websiteRegex.test(form.website)
          ? "Enter a valid website URL"
          : null,
    };
  }, [form]);

  const isFormValid = Object.values(errors).every((e) => e === null);

  /* ---------------- IMAGE PICKER ---------------- */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setForm((p) => ({ ...p, avatar_url: result.assets[0].uri }));
    }
  };

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    if (!isFormValid || saving) return;

    setSaving(true);
    try {
      let avatarPath = form.avatar_url;

      if (avatarPath?.startsWith("file://")) {
        avatarPath = await uploadAvatar(avatarPath, userId);
      }

      await updateProfile({
        ...form,
        avatar_url: avatarPath,
      });

      router.back();
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <GradientHeader title="Edit Profile" />

      <ScrollView className="px-4" keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <TouchableOpacity onPress={pickImage} className="self-center my-6">
          <Image
            source={avatarUri ? { uri: avatarUri } : defaultAvatar}
            className="w-28 h-28 rounded-full"
          />
          <View className="absolute bottom-0 right-0 bg-primary p-2 rounded-full">
            <Ionicons name="camera" size={18} color="white" />
          </View>
        </TouchableOpacity>

        {/* Full Name */}
        <InputLabel>Full Name</InputLabel>
        <TextInput
          placeholder="Enter your full name"
          value={form.full_name}
          onChangeText={(v) => setForm((p) => ({ ...p, full_name: v }))}
          className="border border-gray-300 rounded-full px-5  bg-white"
        />
        {errors.full_name && (
          <Text className="text-red-500 text-xs ml-4">
            {errors.full_name}
          </Text>
        )}

        {/* Username */}
        <InputLabel>Username</InputLabel>
        <TextInput
          placeholder="Choose a username"
          value={form.username}
          onChangeText={(v) => {
            setForm((p) => ({ ...p, username: v }));
            setIsUsernameEdited(true);
          }}
          autoCapitalize="none"
          className="border border-gray-300 rounded-full px-5  "
        />
        {!isUsernameEdited && form.full_name && (
          <Text className="text-gray-400 ml-4 text-xs">
            Suggested username: {generateUsername(form.full_name)}
          </Text>
        )}
        {errors.username && (
          <Text className="text-red-500 text-xs ml-4 mt-1">
            {errors.username}
          </Text>
        )}

        {/* Phone */}
        <InputLabel>Phone Number</InputLabel>
        <TextInput
          placeholder="10-digit phone number"
          keyboardType="number-pad"
          value={form.phone}
          onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))}
          className="border border-gray-300 rounded-full px-5"
        />
        {errors.phone && (
          <Text className="text-red-500 text-xs ml-4 mt-1">
            {errors.phone}
          </Text>
        )}

        {/* Website */}
        <InputLabel>Website</InputLabel>
        <TextInput
          placeholder="https://example.com"
          value={form.website}
          onChangeText={(v) => setForm((p) => ({ ...p, website: v }))}
          autoCapitalize="none"
          className="border border-gray-300 rounded-full px-5"
        />
        {errors.website && (
          <Text className="text-red-500 text-xs ml-4 mt-1">
            {errors.website}
          </Text>
        )}

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={!isFormValid || saving}
          className={`mt-8 rounded-full py-4 ${
            !isFormValid || saving ? "bg-gray-300" : "bg-primary"
          }`}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center font-semibold text-lg">
              Save Profile
            </Text>
          )}
        </TouchableOpacity>

        {/* <View className="h-10" /> */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
