import * as Location from "expo-location";
import React, { createContext, useContext, useState } from "react";

type LatLng = {
  latitude: number;
  longitude: number;
};

type SelectedAddress = {
  id: number | null;
  name: string;
  phone: string;
  flat: string | null;
  area: string | null;
  latitude: number;
  longitude: number;
};

type LocationContextType = {
  currentLocation: LatLng | null;
  locationLabel: string | null;
  selectedAddress: SelectedAddress | null;

  setCurrentLocation: (loc: LatLng) => void;
  setLocationLabel: (label: string | null) => void;
  setSelectedAddress: (addr: SelectedAddress | null) => void;

  requestCurrentLocation: () => Promise<LatLng | null>;
};

const LocationContext = createContext<LocationContextType | null>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);

  const requestCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    const loc = await Location.getCurrentPositionAsync({});
    const coords = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };

    setCurrentLocation(coords);
    return coords;
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        locationLabel,
        selectedAddress,
        setCurrentLocation,
        setLocationLabel,
        setSelectedAddress,
        requestCurrentLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export const useLocationContext = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocationContext must be used inside LocationProvider");
  return ctx;
};
