import React from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
} from "react-native";

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
}

export function FormField({
  label,
  error,
  required,
  ...inputProps
}: FormFieldProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <Text className="text-red-500"> *</Text>}
      </Text>
      <TextInput
        className={`border rounded-lg px-3 py-2.5 text-gray-900 bg-white text-sm ${
          error ? "border-red-400" : "border-gray-300"
        }`}
        placeholderTextColor="#9CA3AF"
        {...inputProps}
      />
      {error ? (
        <Text className="text-xs text-red-500 mt-1">{error}</Text>
      ) : null}
    </View>
  );
}
