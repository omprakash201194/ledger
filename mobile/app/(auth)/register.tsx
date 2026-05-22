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
import { Link, useRouter } from "expo-router";
import { authApi } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { FormField } from "@/components/FormField";
import { Toast, useToast } from "@/components/Toast";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const { toast, show: showToast, hide: hideToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8)
      e.password = "Password must be at least 8 characters";
    if (password !== confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authApi.register(name.trim(), email.trim(), password);
      await login(res.token, res.userId, res.email, res.name);
      router.replace("/(app)");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Registration failed. Please try again.";
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
          {/* Header */}
          <View className="bg-indigo-600 px-6 pt-10 pb-14 items-center">
            <View className="bg-white/20 rounded-2xl p-4 mb-3">
              <Ionicons name="library" size={36} color="white" />
            </View>
            <Text className="text-2xl font-bold text-white">Create account</Text>
            <Text className="text-indigo-200 text-sm mt-1">
              Secure your family's financial legacy
            </Text>
          </View>

          <View className="flex-1 -mt-8 mx-4 pb-6">
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
              <Text className="text-xl font-bold text-gray-900 mb-6">
                Register
              </Text>

              <FormField
                label="Full name"
                required
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                placeholder="Your full name"
                error={errors.name}
              />

              <FormField
                label="Email"
                required
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholder="you@example.com"
                error={errors.email}
              />

              <FormField
                label="Password"
                required
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="At least 8 characters"
                error={errors.password}
              />

              <View className="mb-4">
                <FormField
                  label="Confirm password"
                  required
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Re-enter password"
                  error={errors.confirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  className="flex-row items-center gap-1 mt-1"
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={16}
                    color="#6B7280"
                  />
                  <Text className="text-xs text-gray-500">
                    {showPassword ? "Hide" : "Show"} passwords
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleRegister}
                disabled={loading}
                className="bg-indigo-600 rounded-xl py-3.5 items-center mb-5"
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Create account
                  </Text>
                )}
              </TouchableOpacity>

              <View className="flex-row justify-center">
                <Text className="text-sm text-gray-600">
                  Already have an account?{" "}
                </Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity>
                    <Text className="text-sm text-indigo-600 font-semibold">
                      Sign in
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
