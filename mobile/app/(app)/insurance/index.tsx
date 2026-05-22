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
import { InsurancePolicy, insuranceApi, POLICY_TYPE_LABELS } from "@/api/insurance";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { Toast, useToast } from "@/components/Toast";
import { timeAgo, formatCurrency, formatDate } from "@/utils/timeAgo";
import { SectionIntro } from "@/components/SectionIntro";

export default function InsuranceScreen() {
  const router = useRouter();
  const { toast, show: showToast, hide: hideToast } = useToast();

  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPolicies = useCallback(async () => {
    try {
      const data = await insuranceApi.getAll();
      setPolicies(data);
    } catch {
      showToast("Failed to load insurance policies", "error");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPolicies().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPolicies();
    setRefreshing(false);
  }, []);

  const handleDelete = (policy: InsurancePolicy) => {
    Alert.alert(
      "Delete policy",
      `Delete "${policy.insurer} – ${POLICY_TYPE_LABELS[policy.policyType]}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await insuranceApi.delete(policy.id);
              setPolicies((prev) => prev.filter((p) => p.id !== policy.id));
              showToast("Policy deleted", "success");
            } catch {
              showToast("Failed to delete policy", "error");
            }
          },
        },
      ]
    );
  };

  const POLICY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    TERM_LIFE: "heart-outline",
    WHOLE_LIFE: "heart",
    HEALTH: "medical-outline",
    VEHICLE: "car-outline",
    PROPERTY: "home-outline",
    OTHER: "shield-outline",
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Header */}
      <View className="bg-teal-600 px-5 pt-4 pb-8">
        <Text className="text-xl font-bold text-white">Insurance</Text>
        {!loading && policies.length > 0 && (
          <Text className="text-teal-200 text-sm mt-0.5">
            {policies.length} polic{policies.length !== 1 ? "ies" : "y"}
          </Text>
        )}
      </View>

      <View className="flex-1 -mt-4">
        <SectionIntro note="Document all active policies — life, health, vehicle, and property. Include the policy number and beneficiary so your family can file a claim quickly without searching through physical papers." />

        {loading ? (
          <LoadingState message="Loading policies..." />
        ) : policies.length === 0 ? (
          <EmptyState
            icon="shield-outline"
            title="No policies yet"
            subtitle="Add your insurance policies to keep track of coverage for your family."
            ctaLabel="Add policy"
            onCta={() => router.push("/(app)/insurance/form")}
          />
        ) : (
          <FlatList
            data={policies}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#0D9488"
              />
            }
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: 80,
            }}
            renderItem={({ item: policy }) => (
              <TouchableOpacity
                onPress={() =>
                  router.push(`/(app)/insurance/form?id=${policy.id}`)
                }
                className="bg-white rounded-xl mb-3 overflow-hidden"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View className="p-4">
                  <View className="flex-row items-start gap-3">
                    <View className="bg-teal-50 rounded-lg p-2.5">
                      <Ionicons
                        name={POLICY_ICONS[policy.policyType] ?? "shield-outline"}
                        size={22}
                        color="#0D9488"
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-bold text-gray-900">
                          {policy.insurer}
                        </Text>
                        <View className="flex-row gap-1">
                          <TouchableOpacity
                            onPress={() =>
                              router.push(`/(app)/insurance/form?id=${policy.id}`)
                            }
                            className="p-1"
                          >
                            <Ionicons name="pencil-outline" size={14} color="#6B7280" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDelete(policy)}
                            className="p-1"
                          >
                            <Ionicons name="trash-outline" size={14} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View className="bg-teal-100 rounded-full px-2 py-0.5 self-start mt-0.5">
                        <Text className="text-teal-700 text-[10px] font-semibold">
                          {POLICY_TYPE_LABELS[policy.policyType]}
                        </Text>
                      </View>

                      {policy.policyNumber && (
                        <Text className="text-xs text-gray-500 mt-1.5">
                          Policy: {policy.policyNumber}
                        </Text>
                      )}
                      {policy.lifeAssured && (
                        <Text className="text-xs text-gray-500">
                          Assured: {policy.lifeAssured}
                        </Text>
                      )}

                      <View className="flex-row gap-4 mt-2">
                        {policy.sumAssured != null && (
                          <View>
                            <Text className="text-[10px] text-gray-400">Sum assured</Text>
                            <Text className="text-xs font-semibold text-gray-800">
                              {formatCurrency(policy.sumAssured)}
                            </Text>
                          </View>
                        )}
                        {policy.premiumAmount != null && (
                          <View>
                            <Text className="text-[10px] text-gray-400">Premium</Text>
                            <Text className="text-xs font-semibold text-gray-800">
                              {formatCurrency(policy.premiumAmount)}/yr
                            </Text>
                          </View>
                        )}
                        {policy.maturityDate && (
                          <View>
                            <Text className="text-[10px] text-gray-400">Matures</Text>
                            <Text className="text-xs font-semibold text-gray-800">
                              {formatDate(policy.maturityDate)}
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text className="text-xs text-gray-400 mt-2">
                        Updated {timeAgo(policy.updatedAt)}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push("/(app)/insurance/form")}
        className="absolute bottom-6 right-5 bg-teal-600 rounded-2xl w-14 h-14 items-center justify-center"
        style={{
          shadowColor: "#0D9488",
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
