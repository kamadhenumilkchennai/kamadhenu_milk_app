import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";

import { useProductList } from "@/api/products";
import EmptySearchState from "@/components/EmptySearchState";
import Header from "@/components/Header";
import LocationModal from "@/components/Location/LocationModal";
import ProductListItem from "@/components/ProductListItem";
import { useNetwork } from "@/providers/NetworkProvider";
import OfflineBanner from "@/components/OfflineBanner";
// import { useLocationContext } from "@/providers/LocationProvider";

export default function MenuScreen() {
  const { data: products, error, isLoading, refetch } = useProductList();

  // const { setSelectedAddress } = useLocationContext();
  const { isConnected } = useNetwork();

  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [locationModalVisible, setLocationModalVisible] = useState(false);
  // const [addressFormVisible, setAddressFormVisible] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  /** 🔍 Filter products by name */
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchText.trim()) return products;

    return products.filter((product) =>
      product.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [products, searchText]);
  // 🔴 BLOCK entire screen
  if (!isConnected) {
    return <OfflineBanner />;
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return <Text>{error.message}</Text>;
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => <ProductListItem product={item} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ gap: 16, paddingHorizontal: 24 }}
        contentContainerStyle={{
          paddingBottom: 120,
          flexGrow: filteredProducts.length === 0 ? 1 : 0,
        }}
        showsVerticalScrollIndicator={false}
        /** ✅ Sticky Header */
        ListHeaderComponent={
          <Header
            onPress={() => setLocationModalVisible(true)}
            searchText={searchText}
            onSearchChange={setSearchText}
          />
        }
        stickyHeaderIndices={[0]}
        /** ✅ Empty state */
        ListEmptyComponent={
          searchText ? <EmptySearchState searchText={searchText} /> : null
        }
        /** ✅ Pull to refresh */
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* 📍 Location selection modal */}
      <LocationModal
        visible={locationModalVisible}
        onClose={() => {
          setLocationModalVisible(false);
        }}
      />
    </View>
  );
}
