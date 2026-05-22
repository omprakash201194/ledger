import React from "react";
import { Stack } from "expo-router";

export default function TrustedPersonsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Trusted Persons", headerTintColor: "#0D9488" }}
      />
      <Stack.Screen
        name="form"
        options={{ title: "Add / Edit Person", headerTintColor: "#0D9488" }}
      />
    </Stack>
  );
}
