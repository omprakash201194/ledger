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
  RecurringObligation,
  recurringApi,
  OBLIGATION_TYPE_LABELS,
  FREQUENCY_LABELS,
} from "@/api/recurring";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { Toast, useToast } from "@/components/Toast";
import { timeAgo, formatCurrency } from "@/utils/timeAgo";

export default function RecurringScreen() {
  const router = useRouter();
  const { toast, show: showToast, hide: hideToast } = useToast();

  const [obligations, setObligations] = useState<RecurringObligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchObligations = useCallback(async () => {
    try {
      const data = await recurringApi.getAll();
      setObligations(data);
    } catch {
      showToast("Failed to load obligations", "error");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchObligations().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchObligations();
    setRefreshing(false);
  }, []);

  const handleDelete = (obligation: RecurringObligation) => {
    Alert.alert(
      "Delete obligation",
      `Delete "${obligation.payee}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await recurringApi.delete(obligation.id);
              setObligations((prev) =>
                prev.filter((o) => o.id !== obligation.id)
              );
              showToast("Obligation deleted", "success");
            } catch {
              showToast("Failed to delete", "error");
            }
          },
        },
      ]
    );
  };

  const monthlyTotal = obligations.reduce((sum, o) => {
    const freq = o.frequency;
    const monthly =
      freq === "MONTHLY"
        ? o.amount
        : freq === "QUARTERLY"
        ? o.amount / 3
        : freq === "HALF_YEARLY"
        ? o.amount / 6
        : o.amount / 12;
    return sum + monthly;
  }, 0);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {!loading && obligations.length > 0 && (
        <View className="bg-amber-50 border-b border-amber-100 px-4 py-3">
          <Text className="text-xs text-amber-500 font-semibold">
            Estimated monthly outflow
          </Text>
          <Text className="text-xl font-bold text-amber-700">
            {formatCurrency(Math.round(monthlyTotal))}
          </Text>
        </View>
      )}

      {loading ? (
        <LoadingState message="Loading obligations..." />
      ) : obligations.length === 0 ? (
        <EmptyState
          icon="repeat-outline"
          title="No recurring obligations"
          subtitle="Track your EMIs, SIPs, subscriptions, and other regular payments."
          ctaLabel="Add obligation"
          onCta={() => router.push("/recurring/form")}
        />
      ) : (
        <FlatList
          data={obligations}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#D97706"
            />
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 80,
          }}
          renderItem={({ item: obligation }) => (
            <TouchableOpacity
              onPress={() => router.push(`/recurring/form?id=${obligation.id}`)}
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
                <View className="bg-amber-50 rounded-lg p-2.5">
                  <Ionicons name="repeat-outline" size={20} color="#D97706" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-0.5">
                    <Text className="text-sm font-bold text-gray-900">
                      {obligation.payee}
                    </Text>
                    <View className="flex-row gap-1">
                      <TouchableOpacity
                        onPress={() =>
                          router.push(`/recurring/form?id=${obligation.id}`)
                        }
                        className="p-1"
                      >
                        <Ionicons name="pencil-outline" size={14} color="#6B7280" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(obligation)}
                        className="p-1"
                      >
                        <Ionicons name="trash-outline" size={14} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View className="flex-row gap-2 mb-1.5">
                    <View className="bg-amber-100 rounded-full px-2 py-0.5">
                      <Text className="text-amber-700 text-[10px] font-semibold">
                        {OBLIGATION_TYPE_LABELS[obligation.obligationType]}
                      </Text>
                    </View>
                    <View className="bg-gray-100 rounded-full px-2 py-0.5">
                      <Text className="text-gray-600 text-[10px] font-semibold">
                        {FREQUENCY_LABELS[obligation.frequency]}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-base font-bold text-gray-900">
                    {formatCurrency(obligation.amount)}
                    <Text className="text-xs font-normal text-gray-400">
                      {" "}
                      / {obligation.frequency.toLowerCase()}
                    </Text>
                  </Text>
                  {obligation.paymentSource && (
                    <Text className="text-xs text-gray-500 mt-0.5">
                      Paid from: {obligation.paymentSource}
                    </Text>
                  )}
                  {obligation.dueDay && (
                    <Text className="text-xs text-gray-500">
                      Due on: {obligation.dueDay}th of month
                    </Text>
                  )}
                  <Text className="text-xs text-gray-400 mt-1.5">
                    Updated {timeAgo(obligation.updatedAt)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        onPress={() => router.push("/recurring/form")}
        className="absolute bottom-6 right-5 bg-amber-500 rounded-2xl w-14 h-14 items-center justify-center"
        style={{
          shadowColor: "#D97706",
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
