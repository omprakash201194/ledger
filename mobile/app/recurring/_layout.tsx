import React from "react";
import { Stack } from "expo-router";

export default function RecurringLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Recurring Obligations", headerTintColor: "#D97706" }}
      />
      <Stack.Screen
        name="form"
        options={{ title: "Add / Edit Obligation", headerTintColor: "#D97706" }}
      />
    </Stack>
  );
}
