import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
}

const ICON_MAP: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: "checkmark-circle",
  error: "alert-circle",
  info: "information-circle",
};

const COLOR_MAP: Record<ToastType, string> = {
  success: "bg-green-600",
  error: "bg-red-600",
  info: "bg-indigo-600",
};

export function Toast({
  visible,
  message,
  type = "info",
  duration = 3000,
  onHide,
}: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => onHide());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{ opacity, transform: [{ translateY }] }}
      className="absolute top-14 left-4 right-4 z-50"
    >
      <View
        className={`${COLOR_MAP[type]} rounded-xl px-4 py-3 flex-row items-center gap-2`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Ionicons name={ICON_MAP[type]} size={20} color="white" />
        <Text className="text-white text-sm font-medium flex-1">{message}</Text>
      </View>
    </Animated.View>
  );
}

// Hook for easy toast management
export function useToast() {
  const [toast, setToast] = React.useState<{
    visible: boolean;
    message: string;
    type: ToastType;
  }>({ visible: false, message: "", type: "info" });

  const show = (message: string, type: ToastType = "info") => {
    setToast({ visible: true, message, type });
  };

  const hide = () => setToast((t) => ({ ...t, visible: false }));

  return { toast, show, hide };
}
