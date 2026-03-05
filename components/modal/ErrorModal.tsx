import { Modal, Pressable, Text, View } from "react-native";

export default function ErrorModal({
  visible,
  message,
  onClose,
}: {
  visible: boolean;
  message?: string;
  onClose: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable
        onPress={onClose}
        className="flex-1 bg-black/40 justify-center items-center px-6"
      >
        <View className="bg-background rounded-2xl p-6 w-full">
          <Text className="text-lg font-bold text-red-500 mb-2">Error</Text>
          <Text className="text-text-secondary mb-4">{message}</Text>

          <Pressable onPress={onClose} className="bg-primary rounded-full py-3">
            <Text className="text-center text-text-inverse font-semibold">
              OK
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
