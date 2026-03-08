import { ActivityIndicator, View, ViewStyle } from "react-native";

export type LoadingSize = "small" | "medium" | "large";

export type LoadingProps = {
  size?: LoadingSize;
  color?: string;
  style?: ViewStyle;
  testID?: string;
  className?: string;
};

const sizeMap: Record<LoadingSize, "small" | "large"> = {
  small: "small",
  medium: "small", // React Native doesn't have medium; use small
  large: "large",
};

const colorMap: Record<string, string> = {
  light: "#fff",
  dark: "#121212",
  primary: "#43ce4e",
};

export default function Loading({
  size = "large",
  color = "primary",
  style,
  testID = "loading-indicator",
  className = "",
}: LoadingProps) {
  const nativeSize = sizeMap[size];
  const actualColor = colorMap[color] || color;

  return (
    <View
      style={[
        { flex: 1, justifyContent: "center", alignItems: "center" },
        style,
      ]}
      className={className}
    >
      <ActivityIndicator
        size={nativeSize}
        color={actualColor}
        testID={testID}
      />
    </View>
  );
}
