import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://ledger.onelifestack.com/api";

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach JWT from SecureStore
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync("ledger_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // SecureStore unavailable — proceed without token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear stored credentials
      try {
        await SecureStore.deleteItemAsync("ledger_token");
        await SecureStore.deleteItemAsync("ledger_userId");
        await SecureStore.deleteItemAsync("ledger_email");
        await SecureStore.deleteItemAsync("ledger_name");
      } catch {
        // Ignore cleanup errors
      }
      // Redirect to login — import dynamically to avoid circular dep with authStore
      router.replace("/(auth)/login");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
