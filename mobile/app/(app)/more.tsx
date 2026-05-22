import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";

interface MenuSection {
  title: string;
  items: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    subtitle?: string;
    route?: string;
    color: string;
    bg: string;
    action?: () => void;
  }[];
}

export default function MoreScreen() {
  const router = useRouter();
  const { name, email, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const sections: MenuSection[] = [
    {
      title: "Financial records",
      items: [
        {
          icon: "trending-down-outline",
          label: "Liabilities",
          subtitle: "Loans, credit cards",
          route: "/liabilities",
          color: "#DC2626",
          bg: "#FEF2F2",
        },
        {
          icon: "repeat-outline",
          label: "Recurring Obligations",
          subtitle: "EMIs, SIPs, subscriptions",
          route: "/recurring",
          color: "#D97706",
          bg: "#FFFBEB",
        },
        {
          icon: "laptop-outline",
          label: "Digital Accounts",
          subtitle: "Passwords, online services",
          route: "/digital-accounts",
          color: "#2563EB",
          bg: "#EFF6FF",
        },
      ],
    },
    {
      title: "Estate planning",
      items: [
        {
          icon: "document-text-outline",
          label: "Will & Testament",
          subtitle: "Your Will record",
          route: "/will",
          color: "#7C3AED",
          bg: "#F5F3FF",
        },
        {
          icon: "people-outline",
          label: "Trusted Persons",
          subtitle: "Family, advisors, executors",
          route: "/trusted-persons",
          color: "#0D9488",
          bg: "#F0FDFA",
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          icon: "log-out-outline",
          label: "Sign out",
          color: "#DC2626",
          bg: "#FEF2F2",
          action: handleLogout,
        },
      ],
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Profile header */}
        <View className="bg-indigo-600 px-5 pt-4 pb-8">
          <Text className="text-xl font-bold text-white">More</Text>
        </View>

        <View className="px-4 -mt-4">
          {/* User card */}
          <View
            className="bg-white rounded-2xl p-4 mb-5 flex-row items-center gap-3"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="w-12 h-12 rounded-full bg-indigo-100 items-center justify-center">
              <Text className="text-indigo-600 text-xl font-bold">
                {(name ?? "?")[0]?.toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                {name || "User"}
              </Text>
              <Text className="text-sm text-gray-500">{email}</Text>
            </View>
          </View>

          {sections.map((section) => (
            <View key={section.title} className="mb-5">
              <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mb-2">
                {section.title}
              </Text>
              <View
                className="bg-white rounded-2xl overflow-hidden"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                {section.items.map((item, index) => (
                  <TouchableOpacity
                    key={item.label}
                    onPress={
                      item.action
                        ? item.action
                        : () => router.push(item.route as any)
                    }
                    className={`flex-row items-center gap-3 px-4 py-3.5 ${
                      index < section.items.length - 1
                        ? "border-b border-gray-50"
                        : ""
                    }`}
                  >
                    <View
                      className="w-9 h-9 rounded-lg items-center justify-center"
                      style={{ backgroundColor: item.bg }}
                    >
                      <Ionicons name={item.icon} size={20} color={item.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-800">
                        {item.label}
                      </Text>
                      {item.subtitle && (
                        <Text className="text-xs text-gray-500">
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                    {!item.action && (
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="#D1D5DB"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <Text className="text-center text-xs text-gray-400 mt-2">
            Ledger v1.0.0 — Family Financial Legacy Register
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
