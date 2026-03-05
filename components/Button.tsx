import { forwardRef } from "react";
import { Pressable, Text, View } from "react-native";

type ButtonProps = {
  text: string;
} & React.ComponentPropsWithoutRef<typeof Pressable>;

const Button = forwardRef<View | null, ButtonProps>(
  ({ text, className, disabled, ...pressableProps }, ref) => {
    return (
      <Pressable
        ref={ref}
        disabled={disabled}
        className={`bg-primary px-6 py-4 rounded-full items-center my-2 ${
          disabled ? "opacity-50" : "opacity-100"
        } ${className ?? ""}`}
        {...pressableProps}
      >
        <Text className="text-white text-base font-semibold">
          {text}
        </Text>
      </Pressable>
    );
  }
);

export default Button;
