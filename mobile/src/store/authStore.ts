import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

const KEYS = {
  TOKEN: "ledger_token",
  USER_ID: "ledger_userId",
  EMAIL: "ledger_email",
  NAME: "ledger_name",
} as const;

interface AuthState {
  token: string | null;
  userId: string | null;
  email: string | null;
  name: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  login: (
    token: string,
    userId: string,
    email: string,
    name: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  email: null,
  name: null,
  isAuthenticated: false,
  isInitialized: false,

  initialize: async () => {
    try {
      const [token, userId, email, name] = await Promise.all([
        SecureStore.getItemAsync(KEYS.TOKEN),
        SecureStore.getItemAsync(KEYS.USER_ID),
        SecureStore.getItemAsync(KEYS.EMAIL),
        SecureStore.getItemAsync(KEYS.NAME),
      ]);

      if (token && userId && email) {
        set({
          token,
          userId,
          email,
          name: name ?? "",
          isAuthenticated: true,
          isInitialized: true,
        });
      } else {
        set({ isInitialized: true });
      }
    } catch {
      // SecureStore read failure — treat as logged out
      set({ isInitialized: true });
    }
  },

  login: async (token, userId, email, name) => {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.TOKEN, token),
      SecureStore.setItemAsync(KEYS.USER_ID, userId),
      SecureStore.setItemAsync(KEYS.EMAIL, email),
      SecureStore.setItemAsync(KEYS.NAME, name),
    ]);
    set({ token, userId, email, name, isAuthenticated: true });
  },

  logout: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.TOKEN),
      SecureStore.deleteItemAsync(KEYS.USER_ID),
      SecureStore.deleteItemAsync(KEYS.EMAIL),
      SecureStore.deleteItemAsync(KEYS.NAME),
    ]);
    set({
      token: null,
      userId: null,
      email: null,
      name: null,
      isAuthenticated: false,
    });
  },
}));
