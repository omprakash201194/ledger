import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label: string;
  value: string | undefined;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  searchable?: boolean;
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = "Select...",
  error,
  required,
  searchable = false,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = options.find((o) => o.value === value);
  const filtered = searchable
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <Text className="text-red-500"> *</Text>}
      </Text>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className={`border rounded-lg px-3 py-2.5 flex-row items-center justify-between bg-white ${
          error ? "border-red-400" : "border-gray-300"
        }`}
      >
        <Text
          className={`text-sm flex-1 ${
            selected ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#6B7280" />
      </TouchableOpacity>
      {error ? (
        <Text className="text-xs text-red-500 mt-1">{error}</Text>
      ) : null}

      <Modal visible={open} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <SafeAreaView className="bg-white rounded-t-2xl max-h-[70%]">
            <View className="flex-row items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100">
              <Text className="text-base font-semibold text-gray-900">
                {label}
              </Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {searchable && (
              <View className="px-4 py-2">
                <TextInput
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-gray-50"
                  placeholder="Search..."
                  placeholderTextColor="#9CA3AF"
                  value={search}
                  onChangeText={setSearch}
                />
              </View>
            )}
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`flex-row items-center px-4 py-3 border-b border-gray-50 ${
                    item.value === value ? "bg-indigo-50" : ""
                  }`}
                >
                  <Text
                    className={`flex-1 text-sm ${
                      item.value === value
                        ? "text-indigo-600 font-semibold"
                        : "text-gray-800"
                    }`}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Ionicons name="checkmark" size={18} color="#4F46E5" />
                  )}
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}
