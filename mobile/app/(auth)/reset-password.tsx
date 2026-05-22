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
import { useRouter, useLocalSearchParams } from "expo-router";
import { authApi } from "@/api/auth";
import { FormField } from "@/components/FormField";
import { Toast, useToast } from "@/components/Toast";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { toast, show: showToast, hide: hideToast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!password) e.password = "Password is required";
    else if (password.length < 8)
      e.password = "Password must be at least 8 characters";
    if (password !== confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleReset = async () => {
    if (!token) {
      showToast("Invalid reset link. Please request a new one.", "error");
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        "Failed to reset password. The link may have expired.";
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
          <View className="px-4 pt-4">
            <TouchableOpacity
              onPress={() => router.replace("/(auth)/login")}
              className="flex-row items-center gap-1 py-2"
            >
              <Ionicons name="arrow-back" size={20} color="#4F46E5" />
              <Text className="text-indigo-600 text-sm">Back to login</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 px-4 pt-8">
            {done ? (
              <View
                className="bg-white rounded-2xl p-6 items-center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View className="bg-green-100 rounded-full p-4 mb-4">
                  <Ionicons name="checkmark-circle" size={36} color="#16A34A" />
                </View>
                <Text className="text-xl font-bold text-gray-900 mb-2">
                  Password reset!
                </Text>
                <Text className="text-sm text-gray-600 text-center mb-6">
                  Your password has been reset successfully. You can now sign in
                  with your new password.
                </Text>
                <TouchableOpacity
                  onPress={() => router.replace("/(auth)/login")}
                  className="bg-indigo-600 rounded-xl py-3 px-8 items-center"
                >
                  <Text className="text-white font-semibold">Sign in</Text>
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
                  <Ionicons name="key" size={32} color="#4F46E5" />
                </View>
                <Text className="text-xl font-bold text-gray-900 mb-2">
                  Set new password
                </Text>
                <Text className="text-sm text-gray-600 mb-6">
                  Choose a strong password for your Ledger account.
                </Text>

                <FormField
                  label="New password"
                  required
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="At least 8 characters"
                  error={errors.password}
                />

                <FormField
                  label="Confirm new password"
                  required
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Re-enter new password"
                  error={errors.confirmPassword}
                />

                <TouchableOpacity
                  onPress={handleReset}
                  disabled={loading}
                  className="bg-indigo-600 rounded-xl py-3.5 items-center"
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-semibold text-base">
                      Reset password
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
