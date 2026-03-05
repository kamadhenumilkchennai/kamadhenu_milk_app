import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />

      <View className="flex-1 items-center justify-center px-6 bg-background">
        <Ionicons name="alert-circle-outline" size={80} color="#666" />

        <Text className="text-text-primary font-semibold text-xl mt-4">
          This screen doesn’t exist
        </Text>

        <Text className="text-text-secondary text-center mt-2">
          The page you’re trying to open could not be found
        </Text>

        <Link href="/" className="mt-6">
          <Text className="text-primary font-semibold text-base">
            Go to home screen
          </Text>
        </Link>
      </View>
    </>
  );
}
