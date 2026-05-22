import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({
  icon = "folder-open-outline",
  title,
  subtitle,
  ctaLabel,
  onCta,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="bg-indigo-50 rounded-full p-5 mb-4">
        <Ionicons name={icon} size={40} color="#4F46E5" />
      </View>
      <Text className="text-lg font-semibold text-gray-800 text-center mb-1">
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-sm text-gray-500 text-center mb-5">
          {subtitle}
        </Text>
      ) : null}
      {ctaLabel && onCta ? (
        <TouchableOpacity
          onPress={onCta}
          className="bg-indigo-600 rounded-lg px-6 py-3"
        >
          <Text className="text-white font-semibold text-sm">{ctaLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
