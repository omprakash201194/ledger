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
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { authApi } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { FormField } from "@/components/FormField";
import { Toast, useToast } from "@/components/Toast";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// Required: completes the auth session if the app was opened via a browser redirect
WebBrowser.maybeCompleteAuthSession();

// The deep link that Spring's OAuth2SuccessHandler will redirect to on mobile
const MOBILE_OAUTH_CALLBACK = "ledger://oauth2";
// The OAuth2 initiation URL — ?platform=mobile triggers the cookie that signals mobile redirect
const GOOGLE_OAUTH_URL =
  "https://ledger.onelifestack.com/api/oauth2/authorization/google?platform=mobile";

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const { toast, show: showToast, hide: hideToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authApi.login(email.trim(), password);
      await login(res.token, res.userId, res.email, res.name);
      router.replace("/(app)");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Login failed. Check your credentials.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // openAuthSessionAsync opens a browser tab and monitors for a redirect back to
      // MOBILE_OAUTH_CALLBACK (ledger://oauth2). When Spring's OAuth2SuccessHandler
      // detects the mobile cookie and redirects to ledger://oauth2?token=...&userId=...
      // the OS intercepts it and returns it here as result.url.
      const result = await WebBrowser.openAuthSessionAsync(
        GOOGLE_OAUTH_URL,
        MOBILE_OAUTH_CALLBACK
      );

      if (result.type === "success" && result.url) {
        const parsed = Linking.parse(result.url);
        const params = parsed.queryParams as Record<string, string> | undefined;

        const token = params?.token;
        const userId = params?.userId;
        const userEmail = params?.email;
        const name = params?.name ?? "";

        if (token && userId && userEmail) {
          await login(token, userId, userEmail, name);
          router.replace("/(app)");
        } else {
          showToast("Google sign-in failed — missing credentials.", "error");
        }
      } else if (result.type === "cancel") {
        // User closed the browser — silent, no error toast
      } else {
        showToast("Google sign-in was not completed.", "error");
      }
    } catch (err: any) {
      showToast(err?.message ?? "Google sign-in failed.", "error");
    } finally {
      setGoogleLoading(false);
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
          <View className="bg-indigo-600 px-6 pt-10 pb-16 items-center">
            <View className="bg-white/20 rounded-2xl p-4 mb-3">
              <Ionicons name="library" size={36} color="white" />
            </View>
            <Text className="text-2xl font-bold text-white">Ledger</Text>
            <Text className="text-indigo-200 text-sm mt-1">
              Family Financial Legacy Register
            </Text>
          </View>

          {/* Form card */}
          <View className="flex-1 -mt-8 mx-4">
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
                Sign in
              </Text>

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

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Password <Text className="text-red-500">*</Text>
                </Text>
                <View
                  className={`border rounded-lg flex-row items-center bg-white ${
                    errors.password ? "border-red-400" : "border-gray-300"
                  }`}
                >
                  <FormField
                    label=""
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    placeholder="••••••••"
                    className="flex-1 border-0 mb-0"
                    style={{ flex: 1, borderWidth: 0, marginBottom: 0 }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((v) => !v)}
                    className="px-3"
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password ? (
                  <Text className="text-xs text-red-500 mt-1">
                    {errors.password}
                  </Text>
                ) : null}
              </View>

              <View className="items-end mb-5">
                <Link href="/(auth)/forgot-password" asChild>
                  <TouchableOpacity>
                    <Text className="text-sm text-indigo-600">
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                className="bg-indigo-600 rounded-xl py-3.5 items-center mb-4"
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Sign in
                  </Text>
                )}
              </TouchableOpacity>

              <View className="flex-row items-center mb-4">
                <View className="flex-1 h-px bg-gray-200" />
                <Text className="text-xs text-gray-400 mx-3">or</Text>
                <View className="flex-1 h-px bg-gray-200" />
              </View>

              <TouchableOpacity
                onPress={handleGoogleSignIn}
                disabled={googleLoading}
                className="border border-gray-300 rounded-xl py-3.5 items-center flex-row justify-center gap-2 mb-6"
              >
                {googleLoading ? (
                  <ActivityIndicator size="small" color="#4285F4" />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={18} color="#4285F4" />
                    <Text className="text-gray-700 font-medium text-sm">
                      Continue with Google
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <View className="flex-row justify-center">
                <Text className="text-sm text-gray-600">
                  Don't have an account?{" "}
                </Text>
                <Link href="/(auth)/register" asChild>
                  <TouchableOpacity>
                    <Text className="text-sm text-indigo-600 font-semibold">
                      Register
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
