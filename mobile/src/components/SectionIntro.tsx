import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SectionIntroProps {
  note: string;
}

/** Subtle info banner shown below the page header on every section screen.
 *  Gives first-time users (and family members in an emergency) context
 *  about what this section is for and why it matters. */
export function SectionIntro({ note }: SectionIntroProps) {
  return (
    <View className="mx-4 mb-4 flex-row items-start gap-2.5 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
      <Ionicons name="information-circle-outline" size={16} color="#6366f1" style={{ marginTop: 1 }} />
      <Text className="flex-1 text-sm text-indigo-700 leading-5">{note}</Text>
    </View>
  );
}
