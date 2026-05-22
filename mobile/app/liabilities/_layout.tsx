import React from "react";
import { Stack } from "expo-router";

export default function LiabilitiesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Liabilities", headerTintColor: "#4F46E5" }}
      />
      <Stack.Screen
        name="form"
        options={{ title: "Add / Edit Liability", headerTintColor: "#4F46E5" }}
      />
    </Stack>
  );
}
