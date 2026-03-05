import { Linking, Platform } from "react-native";

export const openMaps = (latitude: number, longitude: number, label?: string) => {
  const latLng = `${latitude},${longitude}`;
  const encodedLabel = label ? encodeURIComponent(label) : "Delivery Location";

  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?ll=${latLng}&q=${encodedLabel}`
      : `https://www.google.com/maps/search/?api=1&query=${latLng}`;

  Linking.openURL(url);
};
