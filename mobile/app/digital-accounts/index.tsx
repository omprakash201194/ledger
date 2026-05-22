import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  DigitalAccount,
  digitalAccountsApi,
  DIGITAL_ACCOUNT_CATEGORY_LABELS,
} from "@/api/digitalAccounts";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { Toast, useToast } from "@/components/Toast";
import { timeAgo } from "@/utils/timeAgo";

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  PASSWORD_MANAGER: "key-outline",
  EMAIL: "mail-outline",
  BANKING: "card-outline",
  INVESTMENT: "trending-up-outline",
  SOCIAL_MEDIA: "people-outline",
  GOVERNMENT: "business-outline",
  SUBSCRIPTION: "refresh-outline",
  OTHER: "globe-outline",
};

export default function DigitalAccountsScreen() {
  const router = useRouter();
  const { toast, show: showToast, hide: hideToast } = useToast();

  const [accounts, setAccounts] = useState<DigitalAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const data = await digitalAccountsApi.getAll();
      setAccounts(data);
    } catch {
      showToast("Failed to load accounts", "error");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchAccounts().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAccounts();
    setRefreshing(false);
  }, []);

  const handleDelete = (account: DigitalAccount) => {
    Alert.alert(
      "Delete account",
      `Delete "${account.serviceName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await digitalAccountsApi.delete(account.id);
              setAccounts((prev) => prev.filter((a) => a.id !== account.id));
              showToast("Account deleted", "success");
            } catch {
              showToast("Failed to delete", "error");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {loading ? (
        <LoadingState message="Loading accounts..." />
      ) : accounts.length === 0 ? (
        <EmptyState
          icon="laptop-outline"
          title="No digital accounts"
          subtitle="Document your online accounts and what should happen to them when you're gone."
          ctaLabel="Add account"
          onCta={() => router.push("/digital-accounts/form")}
        />
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2563EB"
            />
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 80,
          }}
          renderItem={({ item: account }) => (
            <TouchableOpacity
              onPress={() => router.push(`/digital-accounts/form?id=${account.id}`)}
              className="bg-white rounded-xl mb-3 p-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="flex-row items-start gap-3">
                <View className="bg-blue-50 rounded-lg p-2.5">
                  <Ionicons
                    name={CATEGORY_ICONS[account.category] ?? "globe-outline"}
                    size={20}
                    color="#2563EB"
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-0.5">
                    <Text className="text-sm font-bold text-gray-900">
                      {account.serviceName}
                    </Text>
                    <View className="flex-row gap-1">
                      <TouchableOpacity
                        onPress={() =>
                          router.push(`/digital-accounts/form?id=${account.id}`)
                        }
                        className="p-1"
                      >
                        <Ionicons name="pencil-outline" size={14} color="#6B7280" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(account)}
                        className="p-1"
                      >
                        <Ionicons name="trash-outline" size={14} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View className="bg-blue-100 rounded-full px-2 py-0.5 self-start">
                    <Text className="text-blue-700 text-[10px] font-semibold">
                      {DIGITAL_ACCOUNT_CATEGORY_LABELS[account.category]}
                    </Text>
                  </View>
                  {account.username && (
                    <Text className="text-xs text-gray-500 mt-1.5">
                      Username: {account.username}
                    </Text>
                  )}
                  {account.credentialLocation && (
                    <Text className="text-xs text-gray-500">
                      Credentials: {account.credentialLocation}
                    </Text>
                  )}
                  {account.actionOnDeath && (
                    <Text className="text-xs text-gray-500">
                      On death: {account.actionOnDeath}
                    </Text>
                  )}
                  <Text className="text-xs text-gray-400 mt-1.5">
                    Updated {timeAgo(account.updatedAt)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        onPress={() => router.push("/digital-accounts/form")}
        className="absolute bottom-6 right-5 bg-blue-600 rounded-2xl w-14 h-14 items-center justify-center"
        style={{
          shadowColor: "#2563EB",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
