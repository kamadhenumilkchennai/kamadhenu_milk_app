import AddressFormModal from "@/components/Address/AddressFormModal";
import OverlayHeader from "@/components/OverlayHeader";
import { useLocationContext } from "@/providers/LocationProvider";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

/* 🔎 Search suggestion type */
type SearchSuggestion = {
  label: string;
  latitude: number;
  longitude: number;
};

export default function LocationMapScreen() {
  const {
    currentLocation,
    setCurrentLocation,
    setSelectedAddress,
    selectedAddress,
    setLocationLabel,
  } = useLocationContext();

  const mapRef = useRef<MapView>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pin, setPin] = useState(
    currentLocation ?? { latitude: 13.0397, longitude: 80.2793 },
  );

  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [addressFormVisible, setAddressFormVisible] = useState(false);

  /* ✅ SINGLE SOURCE OF TRUTH — PIN ➜ ADDRESS */
  useEffect(() => {
    let active = true;

    const updateAddressFromPin = async () => {
      try {
        const [geo] = await Location.reverseGeocodeAsync(pin);
        if (!geo || !active) return;

        const label = [
          geo.name,
          geo.street,
          geo.city,
          geo.district,
          geo.region,
          geo.country,
        ]
          .filter(Boolean)
          .join(", ");

        setCurrentLocation(pin);

        setSelectedAddress({
          id: null,
          name: "",
          phone: "",
          flat: null,
          area: label || "Selected location",
          latitude: pin.latitude,
          longitude: pin.longitude,
        });

        setLocationLabel(label);
      } catch {
        setLocationLabel("Selected location");
      }
    };

    updateAddressFromPin();
    return () => {
      active = false;
    };
  }, [pin]);

  /* 🔎 Search with suggestions */
  const onSearchChange = (text: string) => {
    setSearchText(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const geoResults = await Location.geocodeAsync(text);

        const detailedResults = await Promise.all(
          geoResults.slice(0, 5).map(async (loc) => {
            const [addr] = await Location.reverseGeocodeAsync({
              latitude: loc.latitude,
              longitude: loc.longitude,
            });

            const label = [
              addr?.name,
              addr?.street,
              addr?.city,
              addr?.district,
              addr?.region,
              addr?.country,
            ]
              .filter(Boolean)
              .join(", ");

            return {
              label: label || text,
              latitude: loc.latitude,
              longitude: loc.longitude,
            };
          }),
        );

        setSuggestions(detailedResults);
      } catch {
        setSuggestions([]);
      }
    }, 400);
  };

  /* 📍 Select suggestion */
  const selectSuggestion = (item: SearchSuggestion) => {
    const coords = {
      latitude: item.latitude,
      longitude: item.longitude,
    };

    setPin(coords); // ✅ ONLY THIS

    setSearchText("");
    setSuggestions([]);
    Keyboard.dismiss();

    mapRef.current?.animateToRegion(
      {
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500,
    );
  };

  /* 🎯 Go to current location */
  const goToCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({});
    const coords = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };

    setPin(coords);

    mapRef.current?.animateToRegion(
      {
        ...coords,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      500,
    );
  };

  return (
    <View className="flex-1">
      <OverlayHeader />

      {/* 🔎 SEARCH BAR */}
      <View className="absolute top-28 left-4 right-4 z-10 bg-background rounded-xl shadow-lg">
        <TextInput
          value={searchText}
          onChangeText={onSearchChange}
          placeholder="Search street, area, city"
          className="px-4 py-3 text-text-primary"
        />

        {suggestions.length > 0 && (
          <View className="border-t border-surface-border">
            {suggestions.map((item, index) => (
              <TouchableOpacity
                key={`${item.latitude}-${item.longitude}`}
                onPress={() => selectSuggestion(item)}
                className="px-4 py-3 border-b border-surface-border"
              >
                <Text numberOfLines={2} className="text-text-primary">
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* 🗺 MAP */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: pin.latitude,
          longitude: pin.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        onPress={(e) => setPin(e.nativeEvent.coordinate)}
      >
        <Marker coordinate={pin} />
      </MapView>

      {/* 🔽 BOTTOM STACKED ACTIONS */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
        className="absolute bottom-4 left-0 right-0"
      >
        <View className="px-4 gap-3">
          {/* 📍 CURRENT LOCATION */}
          <TouchableOpacity
            onPress={goToCurrentLocation}
            className="self-end bg-black/70 rounded-full p-3"
          >
            <Ionicons name="locate" size={22} color="#fff" />
          </TouchableOpacity>

          {/* 📦 LIVE ADDRESS */}
          <View className="bg-background rounded-xl p-4 shadow-lg">
            <Text className="text-text-secondary text-sm mb-1">
              Delivering to
            </Text>
            <Text className="text-text-primary font-semibold" numberOfLines={2}>
              {selectedAddress?.area ?? "Select delivery location"}
            </Text>
          </View>

          {/* ➕ ADD DETAILS */}
          <TouchableOpacity
            onPress={() => setAddressFormVisible(true)}
            className="bg-primary rounded-full py-4 items-center"
            activeOpacity={0.9}
          >
            <Text className="text-background font-bold text-lg">
              Add more address details
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <AddressFormModal
        visible={addressFormVisible}
        onClose={() => setAddressFormVisible(false)}
        latitude={pin.latitude}
        longitude={pin.longitude}
      />
    </View>
  );
}
