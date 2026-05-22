import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { dashboardApi, DashboardSummary } from "@/api/dashboard";
import { assetsApi } from "@/api/assets";
import { liabilitiesApi } from "@/api/liabilities";
import { insuranceApi } from "@/api/insurance";
import { recurringApi } from "@/api/recurring";
import { useAuthStore } from "@/store/authStore";
import { useAlertStore } from "@/store/alertStore";
import { Card } from "@/components/Card";
import { LoadingState } from "@/components/LoadingState";
import { formatCurrency } from "@/utils/timeAgo";
import { SectionIntro } from "@/components/SectionIntro";

interface SectionCount {
  assets: number;
  liabilities: number;
  insurance: number;
  recurring: number;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { name } = useAuthStore();
  const setUnreadCount = useAlertStore((s) => s.setUnreadCount);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [counts, setCounts] = useState<SectionCount>({
    assets: 0,
    liabilities: 0,
    insurance: 0,
    recurring: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [dash, assets, liabilities, insurance, recurring] =
        await Promise.all([
          dashboardApi.getNetWorth(),
          assetsApi.getAll(),
          liabilitiesApi.getAll(),
          insuranceApi.getAll(),
          recurringApi.getAll(),
        ]);
      setSummary(dash);
      setUnreadCount(dash.unreadAlertCount);
      setCounts({
        assets: assets.length,
        liabilities: liabilities.length,
        insurance: insurance.length,
        recurring: recurring.length,
      });
    } catch {
      setError("Unable to load dashboard. Check your connection.");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const allDone =
    counts.assets > 0 &&
    counts.insurance > 0 &&
    counts.liabilities >= 0 &&
    counts.recurring > 0;

  const checklist = [
    {
      label: "Add your first asset",
      done: counts.assets > 0,
      route: "/(app)/assets",
    },
    {
      label: "Add an insurance policy",
      done: counts.insurance > 0,
      route: "/(app)/insurance",
    },
    {
      label: "Set up your Will",
      done: false,
      route: "/will",
    },
    {
      label: "Add trusted persons",
      done: false,
      route: "/trusted-persons",
    },
  ];

  const netWorth = summary?.netWorth ?? 0;
  const totalAssets = summary?.totalAssets ?? 0;
  const totalLiabilities = summary?.totalLiabilities ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4F46E5"
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View className="bg-indigo-600 px-5 pt-4 pb-8">
          <View className="flex-row items-center justify-between mb-1">
            <View>
              <Text className="text-indigo-200 text-sm">Welcome back,</Text>
              <Text className="text-white text-xl font-bold">
                {name || "Family Member"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(app)/alerts")}
              className="relative bg-white/20 rounded-xl p-2.5"
            >
              <Ionicons name="notifications-outline" size={22} color="white" />
              {(summary?.unreadAlertCount ?? 0) > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
                  <Text className="text-white text-[9px] font-bold">
                    {summary!.unreadAlertCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-4 -mt-6">
          {loading ? (
            <View className="bg-white rounded-2xl p-8">
              <LoadingState message="Loading your financial summary..." />
            </View>
          ) : error ? (
            <View className="bg-white rounded-2xl p-6 items-center">
              <Ionicons name="cloud-offline-outline" size={40} color="#9CA3AF" />
              <Text className="text-gray-500 text-sm mt-2 text-center">
                {error}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setLoading(true);
                  fetchData().finally(() => setLoading(false));
                }}
                className="mt-3 bg-indigo-600 rounded-lg px-5 py-2"
              >
                <Text className="text-white text-sm font-medium">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Net worth card */}
              <Card className="mb-4">
                <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Net Worth
                </Text>
                <Text
                  className={`text-3xl font-bold mb-4 ${
                    netWorth >= 0 ? "text-gray-900" : "text-red-600"
                  }`}
                >
                  {formatCurrency(netWorth)}
                </Text>

                {/* Bar chart */}
                {(totalAssets > 0 || totalLiabilities > 0) && (
                  <View className="mb-4">
                    <View className="flex-row h-3 rounded-full overflow-hidden bg-gray-100">
                      {totalAssets > 0 && (
                        <View
                          className="bg-green-500 h-full"
                          style={{
                            flex:
                              totalAssets /
                              Math.max(totalAssets + totalLiabilities, 1),
                          }}
                        />
                      )}
                      {totalLiabilities > 0 && (
                        <View
                          className="bg-red-400 h-full"
                          style={{
                            flex:
                              totalLiabilities /
                              Math.max(totalAssets + totalLiabilities, 1),
                          }}
                        />
                      )}
                    </View>
                    <View className="flex-row justify-between mt-1.5">
                      <View className="flex-row items-center gap-1">
                        <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        <Text className="text-xs text-gray-500">
                          Assets {formatCurrency(totalAssets)}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <View className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <Text className="text-xs text-gray-500">
                          Debt {formatCurrency(totalLiabilities)}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Section counts grid */}
                <View className="flex-row flex-wrap gap-2">
                  {[
                    {
                      label: "Assets",
                      count: counts.assets,
                      icon: "wallet-outline" as const,
                      color: "text-indigo-600",
                      bg: "bg-indigo-50",
                      route: "/(app)/assets",
                    },
                    {
                      label: "Insurance",
                      count: counts.insurance,
                      icon: "shield-checkmark-outline" as const,
                      color: "text-teal-600",
                      bg: "bg-teal-50",
                      route: "/(app)/insurance",
                    },
                    {
                      label: "Liabilities",
                      count: counts.liabilities,
                      icon: "trending-down-outline" as const,
                      color: "text-red-600",
                      bg: "bg-red-50",
                      route: "/liabilities",
                    },
                    {
                      label: "Recurring",
                      count: counts.recurring,
                      icon: "repeat-outline" as const,
                      color: "text-amber-600",
                      bg: "bg-amber-50",
                      route: "/recurring",
                    },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.label}
                      onPress={() => router.push(item.route as any)}
                      className={`flex-1 min-w-[44%] ${item.bg} rounded-xl p-3`}
                    >
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={item.color.replace("text-", "").replace("-600", "")}
                      />
                      <Text className="text-2xl font-bold text-gray-900 mt-1">
                        {item.count}
                      </Text>
                      <Text className="text-xs text-gray-500">{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>

              {/* Alerts banner */}
              {(summary?.unreadAlertCount ?? 0) > 0 && (
                <TouchableOpacity
                  onPress={() => router.push("/(app)/alerts")}
                  className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex-row items-center gap-3"
                >
                  <Ionicons name="warning-outline" size={22} color="#D97706" />
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-amber-800">
                      {summary!.unreadAlertCount} unread alert
                      {summary!.unreadAlertCount !== 1 ? "s" : ""}
                    </Text>
                    <Text className="text-xs text-amber-600">
                      Tap to view and dismiss
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#D97706" />
                </TouchableOpacity>
              )}

              <SectionIntro note="Your financial life at a glance. The numbers here are a summary of what you've recorded across each section. Update each section periodically — the more current it is, the more useful it becomes for you today and for your family if you cannot act yourself." />

              {/* Onboarding checklist */}
              {!allDone && (
                <Card className="mb-4">
                  <Text className="text-sm font-semibold text-gray-800 mb-3">
                    Getting started
                  </Text>
                  {checklist.map((item) => (
                    <TouchableOpacity
                      key={item.label}
                      onPress={() => router.push(item.route as any)}
                      className="flex-row items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                    >
                      <View
                        className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                          item.done
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300"
                        }`}
                      >
                        {item.done && (
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color="white"
                          />
                        )}
                      </View>
                      <Text
                        className={`flex-1 text-sm ${
                          item.done
                            ? "line-through text-gray-400"
                            : "text-gray-700"
                        }`}
                      >
                        {item.label}
                      </Text>
                      {!item.done && (
                        <Ionicons
                          name="chevron-forward"
                          size={14}
                          color="#9CA3AF"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </Card>
              )}

              {/* Quick actions */}
              <Card>
                <Text className="text-sm font-semibold text-gray-800 mb-3">
                  Quick actions
                </Text>
                {[
                  {
                    icon: "add-circle-outline" as const,
                    label: "Add asset",
                    route: "/(app)/assets/form",
                    color: "#4F46E5",
                  },
                  {
                    icon: "shield-outline" as const,
                    label: "Add insurance",
                    route: "/(app)/insurance/form",
                    color: "#0D9488",
                  },
                  {
                    icon: "document-text-outline" as const,
                    label: "Update Will",
                    route: "/will",
                    color: "#7C3AED",
                  },
                  {
                    icon: "people-outline" as const,
                    label: "Manage trusted persons",
                    route: "/trusted-persons",
                    color: "#D97706",
                  },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    onPress={() => router.push(item.route as any)}
                    className="flex-row items-center gap-3 py-3 border-b border-gray-50 last:border-0"
                  >
                    <View
                      className="w-9 h-9 rounded-lg items-center justify-center"
                      style={{ backgroundColor: item.color + "15" }}
                    >
                      <Ionicons name={item.icon} size={20} color={item.color} />
                    </View>
                    <Text className="flex-1 text-sm text-gray-700">
                      {item.label}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                ))}
              </Card>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
