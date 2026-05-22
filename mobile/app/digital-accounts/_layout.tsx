import React from "react";
import { Stack } from "expo-router";

export default function DigitalAccountsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Digital Accounts", headerTintColor: "#2563EB" }}
      />
      <Stack.Screen
        name="form"
        options={{ title: "Add / Edit Account", headerTintColor: "#2563EB" }}
      />
    </Stack>
  );
}
