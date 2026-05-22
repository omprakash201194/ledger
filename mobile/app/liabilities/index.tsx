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
  Liability,
  liabilitiesApi,
  LIABILITY_TYPE_LABELS,
} from "@/api/liabilities";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { Toast, useToast } from "@/components/Toast";
import { timeAgo, formatCurrency, formatDate } from "@/utils/timeAgo";
import { SectionIntro } from "@/components/SectionIntro";

export default function LiabilitiesScreen() {
  const router = useRouter();
  const { toast, show: showToast, hide: hideToast } = useToast();

  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLiabilities = useCallback(async () => {
    try {
      const data = await liabilitiesApi.getAll();
      setLiabilities(data);
    } catch {
      showToast("Failed to load liabilities", "error");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchLiabilities().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLiabilities();
    setRefreshing(false);
  }, []);

  const handleDelete = (liability: Liability) => {
    Alert.alert(
      "Delete liability",
      `Delete "${liability.lender}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await liabilitiesApi.delete(liability.id);
              setLiabilities((prev) =>
                prev.filter((l) => l.id !== liability.id)
              );
              showToast("Liability deleted", "success");
            } catch {
              showToast("Failed to delete", "error");
            }
          },
        },
      ]
    );
  };

  const totalOutstanding = liabilities.reduce(
    (s, l) => s + (l.outstandingBalance ?? 0),
    0
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {!loading && liabilities.length > 0 && (
        <View className="bg-red-50 border-b border-red-100 px-4 py-3">
          <Text className="text-xs text-red-500 font-semibold">
            Total outstanding
          </Text>
          <Text className="text-xl font-bold text-red-700">
            {formatCurrency(totalOutstanding)}
          </Text>
        </View>
      )}

      <SectionIntro note="Record all outstanding loans and debts — home loans, car loans, personal loans, and credit cards. Your family needs to know which payments must continue and which need to be settled." />

      {loading ? (
        <LoadingState message="Loading liabilities..." />
      ) : liabilities.length === 0 ? (
        <EmptyState
          icon="trending-down-outline"
          title="No liabilities"
          subtitle="Add loans, credit cards, or other debts to track what you owe."
          ctaLabel="Add liability"
          onCta={() => router.push("/liabilities/form")}
        />
      ) : (
        <FlatList
          data={liabilities}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#DC2626"
            />
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 80,
          }}
          renderItem={({ item: liability }) => (
            <TouchableOpacity
              onPress={() =>
                router.push(`/liabilities/form?id=${liability.id}`)
              }
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
                <View className="bg-red-50 rounded-lg p-2.5">
                  <Ionicons name="trending-down-outline" size={20} color="#DC2626" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-0.5">
                    <Text className="text-sm font-bold text-gray-900">
                      {liability.lender}
                    </Text>
                    <View className="flex-row gap-1">
                      <TouchableOpacity
                        onPress={() =>
                          router.push(`/liabilities/form?id=${liability.id}`)
                        }
                        className="p-1"
                      >
                        <Ionicons name="pencil-outline" size={14} color="#6B7280" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(liability)}
                        className="p-1"
                      >
                        <Ionicons name="trash-outline" size={14} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View className="bg-red-100 rounded-full px-2 py-0.5 self-start">
                    <Text className="text-red-700 text-[10px] font-semibold">
                      {LIABILITY_TYPE_LABELS[liability.liabilityType]}
                    </Text>
                  </View>

                  <View className="flex-row gap-4 mt-2">
                    {liability.outstandingBalance != null && (
                      <View>
                        <Text className="text-[10px] text-gray-400">Outstanding</Text>
                        <Text className="text-xs font-bold text-red-600">
                          {formatCurrency(liability.outstandingBalance)}
                        </Text>
                      </View>
                    )}
                    {liability.emiAmount != null && (
                      <View>
                        <Text className="text-[10px] text-gray-400">EMI</Text>
                        <Text className="text-xs font-semibold text-gray-700">
                          {formatCurrency(liability.emiAmount)}/mo
                        </Text>
                      </View>
                    )}
                    {liability.tenureEndDate && (
                      <View>
                        <Text className="text-[10px] text-gray-400">Ends</Text>
                        <Text className="text-xs font-semibold text-gray-700">
                          {formatDate(liability.tenureEndDate)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-xs text-gray-400 mt-1.5">
                    Updated {timeAgo(liability.updatedAt)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push("/liabilities/form")}
        className="absolute bottom-6 right-5 bg-red-600 rounded-2xl w-14 h-14 items-center justify-center"
        style={{
          shadowColor: "#DC2626",
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
