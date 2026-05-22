import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-16">
      <ActivityIndicator size="large" color="#4F46E5" />
      <Text className="mt-3 text-sm text-gray-500">{message}</Text>
    </View>
  );
}
