import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
  searchText: string;
};

export default function EmptySearchState({ searchText }: Props) {
  return (
    <View className="flex-1 justify-center items-center mt-20 px-6">
      <Ionicons
        name="search-outline"
        size={64}
        color="#9ca3af" // gray-400
      />

      <Text className="mt-4 text-lg font-semibold text-gray-700">
        No products found
      </Text>

      <Text className="mt-2 text-center text-gray-500">
        We couldn’t find anything matching{" "}
        <Text className="font-medium">"{searchText}"</Text>
      </Text>

      <Text className="mt-1 text-center text-gray-400">
        Try searching with a different keyword
      </Text>
    </View>
  );
}
