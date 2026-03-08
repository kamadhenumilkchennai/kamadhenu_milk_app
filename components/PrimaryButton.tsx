import { forwardRef } from "react";
import {
    ActivityIndicator,
    Pressable,
    Text,
    View,
    ViewStyle,
} from "react-native";

export type PrimaryButtonVariant = "primary" | "secondary" | "ghost";

export type PrimaryButtonProps = {
  title?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: PrimaryButtonVariant;
  style?: ViewStyle;
  testID?: string;
  className?: string;
};

const variantStyles: Record<PrimaryButtonVariant, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary border-primary border",
  ghost: "bg-transparent border-primary border",
};

const variantTextStyles: Record<PrimaryButtonVariant, string> = {
  primary: "text-inverse",
  secondary: "text-primary",
  ghost: "text-primary",
};

const PrimaryButton = forwardRef<View | null, PrimaryButtonProps>(
  (
    {
      title,
      children,
      onPress,
      loading = false,
      disabled = false,
      variant = "primary",
      style,
      testID,
      className = "",
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const baseStyle =
      "px-6 py-4 rounded-full items-center justify-center my-2 flex-row";
    const variantStyle = variantStyles[variant];
    const disabledStyle = isDisabled ? "opacity-50" : "opacity-100";
    const textColor = variantTextStyles[variant];

    return (
      <Pressable
        ref={ref}
        disabled={isDisabled}
        onPress={onPress}
        style={style}
        testID={testID}
        className={`${baseStyle} ${variantStyle} ${disabledStyle} ${className}`}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === "primary" ? "#fff" : "#43ce4e"}
          />
        ) : (
          <>
            {children}
            {title && (
              <Text className={`text-base font-semibold ${textColor}`}>
                {title}
              </Text>
            )}
          </>
        )}
      </Pressable>
    );
  },
);

PrimaryButton.displayName = "PrimaryButton";

export default PrimaryButton;
