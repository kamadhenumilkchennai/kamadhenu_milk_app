import NetInfo from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type NetworkContextType = {
  isConnected: boolean;
};

const NetworkContext = createContext<NetworkContextType | null>(null);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(true);
  const wasConnected = useRef(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected =
        Boolean(state.isConnected) &&
        Boolean(state.isInternetReachable);

      // 🔁 Refetch ONLY ONCE when coming back online
      if (!wasConnected.current && connected) {
        queryClient.invalidateQueries({
          refetchType: "active",
        });
      }

      wasConnected.current = connected;
      setIsConnected(connected);
    });

    return unsubscribe;
  }, [queryClient]);

  return (
    <NetworkContext.Provider value={{ isConnected }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) {
    throw new Error("useNetwork must be used inside NetworkProvider");
  }
  return ctx;
}
