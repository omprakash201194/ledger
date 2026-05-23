import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@/contexts/ThemeContext";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized, initialize } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(app)");
    }
  }, [isAuthenticated, isInitialized, segments]);

  if (!isInitialized) {
    return (
      <View className="flex-1 items-center justify-center bg-indigo-600">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
        <AuthGuard>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
            <Stack.Screen name="liabilities" />
            <Stack.Screen name="digital-accounts" />
            <Stack.Screen name="recurring" />
            <Stack.Screen name="trusted-persons" />
            <Stack.Screen name="will" options={{ headerShown: true, title: "Will & Testament", headerTintColor: "#4F46E5" }} />
          </Stack>
        </AuthGuard>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
