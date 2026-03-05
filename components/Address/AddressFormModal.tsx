import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { useInsertAddress } from "@/api/addresses";
import { useAuth } from "@/providers/AuthProvider";
import { useLocationContext } from "@/providers/LocationProvider";

type Props = {
  visible: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
};

export default function AddressFormModal({
  visible,
  latitude,
  longitude,
  onClose,
}: Props) {
  const { session, profile } = useAuth();
  const { selectedAddress, setSelectedAddress } = useLocationContext();

  const [loading, setLoading] = useState(false);

  const [orderFor, setOrderFor] = useState<"self" | "other">("self");
  const [addressType, setAddressType] = useState<
    "Home" | "Work" | "Hotel" | "Other"
  >("Home");

  const [flat, setFlat] = useState("");
  const [floor, setFloor] = useState("");
  const [landmark, setLandmark] = useState("");

  const [name, setName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");

  /* ---------------- VALIDATION STATE ---------------- */

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const insertAddress = useInsertAddress();

  const flatError = submitAttempted && !flat.trim();
  const nameError = submitAttempted && !name.trim();
  const phoneError = submitAttempted && !/^[0-9]{10}$/.test(phone.trim());

  /* ---------------- SAVE ---------------- */

  const handleSave = () => {
    setSubmitAttempted(true);

    if (!session) {
      Alert.alert("Please login first");
      return;
    }

    if (flatError || nameError || phoneError) return;

    if (!selectedAddress?.area) {
      Alert.alert("Area / locality is required");
      return;
    }

    insertAddress.mutate(
      {
        user_id: session.user.id,
        order_for: orderFor,
        address_type: addressType,
        flat,
        floor: floor || null,
        landmark: landmark || null,
        area: selectedAddress.area,
        name,
        phone,
        is_default: false,
        latitude,
        longitude,
        deleted: false,
      },
      {
        onSuccess: (data) => {
          if (data.latitude == null || data.longitude == null) {
            Alert.alert("Error", "Location coordinates missing");
            return;
          }

          setSelectedAddress({
            id: data.id,
            name: data.name,
            phone: data.phone,
            flat: data.flat,
            area: data.area,
            latitude: data.latitude,
            longitude: data.longitude,
          });

          onClose();
          router.replace("/(user)/menu");
        },
        onError: (err: unknown) => {
          const message = (err as Error)?.message ?? String(err);
          Alert.alert("Error", message);
        },
      },
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end bg-black/40">
          <TouchableWithoutFeedback>
            <View className="bg-background rounded-t-3xl h-[50%] relative">
              {/* CLOSE */}
              <Pressable
                onPress={onClose}
                className="absolute -top-16 self-center bg-surface-elevated rounded-full p-4 z-10"
              >
                <Ionicons name="close" size={22} color="#111827" />
              </Pressable>

              {/* HEADER */}
              <View className="px-5 pt-6 pb-4 border-b border-surface-border">
                <Text className="text-xl font-bold text-text-primary">
                  Enter complete address
                </Text>
              </View>

              {/* CONTENT */}
              <ScrollView
                className="px-5 py-4"
                contentContainerStyle={{ paddingBottom: 140 }}
                showsVerticalScrollIndicator={false}
              >
                <Text className="text-text-secondary mb-3">
                  Who you are ordering for?
                </Text>

                <View className="flex-row gap-6 mb-5">
                  <Radio
                    label="Myself"
                    active={orderFor === "self"}
                    onPress={() => setOrderFor("self")}
                  />
                  <Radio
                    label="Someone else"
                    active={orderFor === "other"}
                    onPress={() => setOrderFor("other")}
                  />
                </View>

                <View className="flex-row gap-3 mb-5">
                  {["Home", "Work", "Hotel", "Other"].map((type) => (
                    <Chip
                      key={type}
                      label={type}
                      active={addressType === type}
                      onPress={() => setAddressType(type as typeof addressType)}
                    />
                  ))}
                </View>

                <Input
                  label="Flat / House no / Building name *"
                  value={flat}
                  onChangeText={setFlat}
                  error={flatError}
                  errorText="Flat / house number is required"
                />

                <Input
                  label="Floor (optional)"
                  value={floor}
                  onChangeText={setFloor}
                />

                {/* AREA */}
                <View className="mb-5">
                  <Text className="text-text-secondary mb-2">
                    Area / Sector / Locality *
                  </Text>
                  <View className="bg-surface border border-surface-border rounded-xl p-4">
                    <Text className="text-text-primary text-sm">
                      {selectedAddress?.area}
                    </Text>
                  </View>
                </View>

                <Input
                  label="Nearby landmark (optional)"
                  value={landmark}
                  onChangeText={setLandmark}
                />

                <Text className="text-text-secondary mb-2 mt-2">
                  {orderFor === "self"
                    ? "Enter your details"
                    : "Receiver details"}
                </Text>

                <Input
                  label="Name *"
                  value={name}
                  onChangeText={setName}
                  error={nameError}
                  errorText="Name is required"
                />

                <Input
                  label="Phone *"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={(text) => {
                    const digitsOnly = text.replace(/\D/g, "");
                    if (digitsOnly.length <= 10) {
                      setPhone(digitsOnly);
                    }
                  }}
                  error={phoneError}
                  errorText="Phone number must be 10 digits"
                />
              </ScrollView>

              {/* FOOTER */}
              <View className="px-5 py-4 border-t border-surface-border absolute bottom-0 w-full bg-background">
                <TouchableOpacity
                  activeOpacity={0.9}
                  disabled={loading}
                  onPress={handleSave}
                  className="bg-primary rounded-full py-4"
                >
                  <Text className="text-text-inverse text-center text-lg font-bold">
                    {loading ? "Saving..." : "Save address"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

/* ---------------- UI PARTS ---------------- */

function Radio({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} className="flex-row items-center gap-2">
      <View
        className={`w-5 h-5 rounded-full border-2 ${
          active ? "border-primary" : "border-text-tertiary"
        } items-center justify-center`}
      >
        {active && <View className="w-3 h-3 bg-primary rounded-full" />}
      </View>
      <Text className="text-text-primary">{label}</Text>
    </TouchableOpacity>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-xl border ${
        active
          ? "border-primary bg-background-subtle"
          : "border-surface-border bg-surface"
      }`}
    >
      <Text
        className={`font-medium ${
          active ? "text-primary" : "text-text-primary"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Input({
  label,
  keyboardType,
  value,
  onChangeText,
  error,
  errorText,
}: {
  label: string;
  keyboardType?: React.ComponentProps<typeof TextInput>["keyboardType"];
  value?: string;
  onChangeText?: (text: string) => void;
  error?: boolean;
  errorText?: string;
}) {
  return (
    <View className="mb-4">
      <Text className="text-text-secondary mb-2">{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#9ca3af"
        className={`bg-surface border rounded-xl px-4 py-3 text-text-primary ${
          error ? "border-red-500" : "border-surface-border"
        }`}
      />
      {error && (
        <Text className="text-red-500 text-xs mt-1 ml-1">{errorText}</Text>
      )}
    </View>
  );
}
