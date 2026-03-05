import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { Address, useDeleteAddress, useUserAddresses } from "@/api/addresses";
import { formatPhone } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { useLocationContext } from "@/providers/LocationProvider";

/* -------------------------------------------
   COMPONENT
-------------------------------------------- */

export default function LocationModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { session } = useAuth();

  const { setCurrentLocation, setSelectedAddress } = useLocationContext();

  /* -------------------------------------------
     REACT QUERY
  -------------------------------------------- */

  const { data: addresses = [], isLoading } = useUserAddresses(
    session?.user.id,
    visible
  );

  const deleteAddress = useDeleteAddress();

  /* -------------------------------------------
     HANDLERS
  -------------------------------------------- */

  const handleUseCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }

      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        Alert.alert("Location Disabled", "Please enable GPS");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      router.push({
        pathname: "/locationMap",
        params: {
          lat: latitude.toString(),
          lng: longitude.toString(),
        },
      });

      onClose();
    } catch (err) {
      Alert.alert("Location Error", "Unable to fetch current location");
      console.error(err);
    }
  };

  const handleSelectAddress = (addr: Address) => {
    if (addr.latitude == null || addr.longitude == null) {
      Alert.alert(
        "Location unavailable",
        "This address does not have a valid location."
      );
      return;
    }

    setCurrentLocation({
      latitude: addr.latitude,
      longitude: addr.longitude,
    });

    setSelectedAddress({
      id: addr.id,
      name: addr.name,
      phone: addr.phone,
      flat: addr.flat,
      area: addr.area,
      latitude: addr.latitude,
      longitude: addr.longitude,
    });

    onClose();
  };

  const handleDeleteAddress = (addr: Address) => {
    Alert.alert(
      "Delete address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteAddress.mutate(addr.id),
        },
      ]
    );
  };

  /* -------------------------------------------
     UI
  -------------------------------------------- */

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
            <View className="bg-background rounded-t-3xl p-6 relative">
              {/* Close Button */}
              <Pressable
                onPress={onClose}
                className="absolute -top-14 self-center bg-background rounded-full p-3 shadow-lg"
              >
                <Ionicons name="close" size={22} color="#666" />
              </Pressable>

              <Text className="text-xl font-bold text-text-primary mb-4">
                Choose delivery location
              </Text>

              {/* Saved Addresses */}
              {!isLoading && addresses.length > 0 && (
                <>
                  <Text className="text-text-secondary mb-2">
                    Your saved addresses
                  </Text>

                  <ScrollView
                    className="mb-3"
                    showsVerticalScrollIndicator={false}
                    style={{ maxHeight: 220 }}
                  >
                    {addresses.map((addr) => (
                      <TouchableOpacity
                        key={addr.id}
                        onPress={() => handleSelectAddress(addr)}
                        className="bg-background-subtle rounded-xl p-4 mb-3"
                      >
                        <View className="flex-row justify-between items-start">
                          <View className="flex-1 pr-3">
                            <Text className="font-semibold text-text-primary">
                              {addr.name}
                            </Text>

                            <Text
                              numberOfLines={2}
                              className="text-text-secondary text-sm mt-1"
                            >
                              {addr.flat}, {addr.area}
                            </Text>

                            <Text className="text-text-secondary text-sm mt-1">
                              Phone number: {formatPhone(addr.phone)}
                            </Text>
                          </View>

                          {/* Delete Button */}
                          <Pressable onPress={() => handleDeleteAddress(addr)}>
                            <Ionicons
                              name="trash-outline"
                              size={20}
                              color="#EF4444"
                            />
                          </Pressable>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              {/* Current Location */}
              <TouchableOpacity
                onPress={handleUseCurrentLocation}
                className="flex-row items-center justify-between py-4"
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name="locate-outline" size={22} color="#1DB954" />
                  <Text className="text-text-primary font-semibold">
                    Use current location
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>

              {/* Cancel */}
              <TouchableOpacity onPress={onClose} className="mt-6">
                <Text className="text-center text-text-secondary">Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
