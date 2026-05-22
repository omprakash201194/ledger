import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Alert, alertsApi, ALERT_COLORS } from "@/api/alerts";
import { useAlertStore } from "@/store/alertStore";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { Toast, useToast } from "@/components/Toast";
import { timeAgo } from "@/utils/timeAgo";

const ALERT_TYPE_LABELS: Record<string, string> = {
  INSURANCE_PREMIUM_DUE: "Premium Due",
  EMI_DUE: "EMI Due",
  WILL_REVIEW_DUE: "Will Review",
  WILL_NO_REVIEW: "No Will Set",
  OBLIGATION_REVIEW: "Review Needed",
  ASSET_VALUE_STALE: "Value Stale",
  NOMINEE_MISSING: "Nominee Missing",
  FD_MATURITY_DUE: "FD Matures Soon",
  EMI_ENDING_SOON: "EMI Ending Soon",
};

export default function AlertsScreen() {
  const { setUnreadCount, decrementUnreadCount } = useAlertStore();
  const { toast, show: showToast, hide: hideToast } = useToast();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await alertsApi.getAll();
      // Unread first
      const sorted = [...data].sort((a, b) => {
        if (a.isRead === b.isRead) {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        return a.isRead ? 1 : -1;
      });
      setAlerts(sorted);
      setUnreadCount(sorted.filter((a) => !a.isRead).length);
    } catch {
      showToast("Failed to load alerts", "error");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchAlerts().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  }, []);

  const handleMarkRead = async (alert: Alert) => {
    if (alert.isRead) return;
    try {
      await alertsApi.markRead(alert.id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alert.id ? { ...a, isRead: true } : a))
      );
      decrementUnreadCount();
    } catch {
      showToast("Failed to mark as read", "error");
    }
  };

  const renderAlert = ({ item }: { item: Alert }) => {
    const colors = ALERT_COLORS[item.alertType] ?? {
      bg: "bg-gray-50",
      text: "text-gray-700",
      badge: "bg-gray-100",
    };
    return (
      <TouchableOpacity
        onPress={() => handleMarkRead(item)}
        className={`mx-4 mb-3 rounded-xl p-4 border ${
          item.isRead ? "border-gray-100 bg-white" : `${colors.bg} border-transparent`
        }`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        <View className="flex-row items-start gap-3">
          <View className={`${item.isRead ? "bg-gray-100" : colors.badge} rounded-lg p-2 mt-0.5`}>
            <Ionicons
              name="warning-outline"
              size={16}
              color={item.isRead ? "#9CA3AF" : "#374151"}
            />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <View
                className={`${item.isRead ? "bg-gray-100" : colors.badge} rounded-full px-2 py-0.5`}
              >
                <Text
                  className={`text-[10px] font-semibold ${
                    item.isRead ? "text-gray-500" : colors.text
                  }`}
                >
                  {ALERT_TYPE_LABELS[item.alertType] ?? item.alertType}
                </Text>
              </View>
              {!item.isRead && (
                <View className="w-2 h-2 rounded-full bg-indigo-500" />
              )}
            </View>
            <Text
              className={`text-sm font-semibold mb-0.5 ${
                item.isRead ? "text-gray-500" : "text-gray-900"
              }`}
            >
              {item.title}
            </Text>
            <Text
              className={`text-xs ${item.isRead ? "text-gray-400" : "text-gray-600"}`}
            >
              {item.message}
            </Text>
            <Text className="text-xs text-gray-400 mt-1.5">
              {timeAgo(item.createdAt)}
              {!item.isRead && (
                <Text className="text-indigo-500"> · Tap to dismiss</Text>
              )}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Header */}
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-bold text-gray-900">Alerts</Text>
          {unreadCount > 0 && (
            <Text className="text-xs text-gray-500">
              {unreadCount} unread
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <View className="bg-red-100 rounded-full px-3 py-1">
            <Text className="text-red-600 text-xs font-semibold">
              {unreadCount} new
            </Text>
          </View>
        )}
      </View>

      {loading ? (
        <LoadingState message="Loading alerts..." />
      ) : alerts.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title="All clear!"
          subtitle="No alerts at the moment. Check back later."
        />
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={renderAlert}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4F46E5"
            />
          }
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}
