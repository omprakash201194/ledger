import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";

interface ConfirmModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmModal({
  visible,
  title = "Discard changes?",
  message = "You have unsaved changes. Are you sure you want to discard them?",
  confirmLabel = "Discard",
  cancelLabel = "Keep editing",
  onConfirm,
  onCancel,
  destructive = true,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          <Text className="text-base font-semibold text-gray-900 mb-2">
            {title}
          </Text>
          <Text className="text-sm text-gray-600 mb-6">{message}</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 border border-gray-300 rounded-lg py-3 items-center"
            >
              <Text className="text-sm font-medium text-gray-700">
                {cancelLabel}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              className={`flex-1 rounded-lg py-3 items-center ${
                destructive ? "bg-red-600" : "bg-indigo-600"
              }`}
            >
              <Text className="text-sm font-semibold text-white">
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
