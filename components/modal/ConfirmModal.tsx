import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  visible,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive,
  loading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal transparent visible={visible} animationType="slide">
      <Pressable onPress={onCancel} className="flex-1 bg-black/40 justify-end">
        <Pressable className="bg-background rounded-t-3xl p-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-text-primary">{title}</Text>
            <Pressable onPress={onCancel}>
              <Ionicons name="close" size={22} color="#6b7280" />
            </Pressable>
          </View>

          {description && (
            <Text className="text-text-secondary mb-6">{description}</Text>
          )}

          {/* Actions */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 border border-surface-border rounded-full py-3"
            >
              <Text className="text-center text-text-primary font-semibold">
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={loading}
              onPress={onConfirm}
              className={`flex-1 rounded-full py-3 ${
                destructive ? "bg-red-500" : "bg-primary"
              }`}
            >
              <Text className="text-center text-text-inverse font-semibold">
                {loading ? "Please wait..." : confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
