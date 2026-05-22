import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { authApi } from "@/api/auth";
import { FormField } from "@/components/FormField";
import { Toast, useToast } from "@/components/Toast";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { toast, show: showToast, hide: hideToast } = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email");
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        "Failed to send reset email. Please try again.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <View className="px-4 pt-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center gap-1 py-2"
            >
              <Ionicons name="arrow-back" size={20} color="#4F46E5" />
              <Text className="text-indigo-600 text-sm">Back to login</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 px-4 pt-8">
            {sent ? (
              <View className="bg-white rounded-2xl p-6 items-center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View className="bg-green-100 rounded-full p-4 mb-4">
                  <Ionicons name="mail" size={36} color="#16A34A" />
                </View>
                <Text className="text-xl font-bold text-gray-900 mb-2">
                  Check your email
                </Text>
                <Text className="text-sm text-gray-600 text-center mb-6">
                  We've sent a password reset link to{" "}
                  <Text className="font-semibold">{email}</Text>. Follow the
                  link to reset your password.
                </Text>
                <TouchableOpacity
                  onPress={() => router.replace("/(auth)/login")}
                  className="bg-indigo-600 rounded-xl py-3 px-8 items-center"
                >
                  <Text className="text-white font-semibold">Back to login</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                className="bg-white rounded-2xl p-6"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View className="bg-indigo-50 rounded-full p-4 mb-4 self-center">
                  <Ionicons name="lock-closed" size={32} color="#4F46E5" />
                </View>
                <Text className="text-xl font-bold text-gray-900 mb-2">
                  Forgot password?
                </Text>
                <Text className="text-sm text-gray-600 mb-6">
                  Enter your email address and we'll send you a link to reset
                  your password.
                </Text>

                <FormField
                  label="Email address"
                  required
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  placeholder="you@example.com"
                  error={error}
                />

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  className="bg-indigo-600 rounded-xl py-3.5 items-center"
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-semibold text-base">
                      Send reset link
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
