import { Ionicons } from "@expo/vector-icons";
import { forwardRef } from "react";
import { Pressable, View, ViewStyle } from "react-native";

export type IconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  disabled?: boolean;
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  testID?: string;
  className?: string;
};

const IconButton = forwardRef<View | null, IconButtonProps>(
  (
    {
      icon,
      onPress,
      disabled = false,
      size = 24,
      color = "#121212",
      backgroundColor = "transparent",
      style,
      testID,
      className = "",
    },
    ref,
  ) => {
    const disabledStyle = disabled ? "opacity-50" : "opacity-100";

    return (
      <Pressable
        ref={ref}
        disabled={disabled}
        onPress={onPress}
        style={[
          {
            backgroundColor,
            padding: 8,
            borderRadius: 8,
          },
          style,
        ]}
        testID={testID}
        className={`items-center justify-center ${disabledStyle} ${className}`}
      >
        <Ionicons name={icon} size={size} color={color} />
      </Pressable>
    );
  },
);

IconButton.displayName = "IconButton";

export default IconButton;
