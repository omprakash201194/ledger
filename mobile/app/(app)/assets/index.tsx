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
  Asset,
  assetsApi,
  ASSET_TYPE_LABELS,
  ASSET_CATEGORIES,
} from "@/api/assets";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { Toast, useToast } from "@/components/Toast";
import { timeAgo, formatCurrency } from "@/utils/timeAgo";
import { SectionIntro } from "@/components/SectionIntro";

type SortKey = "value" | "name" | "recent";

export default function AssetsScreen() {
  const router = useRouter();
  const { toast, show: showToast, hide: hideToast } = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState<SortKey>("recent");

  const fetchAssets = useCallback(async () => {
    try {
      const data = await assetsApi.getAll();
      setAssets(data);
    } catch {
      showToast("Failed to load assets", "error");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchAssets().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAssets();
    setRefreshing(false);
  }, []);

  const handleDelete = (asset: Asset) => {
    Alert.alert(
      "Delete asset",
      `Delete "${asset.description}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await assetsApi.delete(asset.id);
              setAssets((prev) => prev.filter((a) => a.id !== asset.id));
              showToast("Asset deleted", "success");
            } catch {
              showToast("Failed to delete asset", "error");
            }
          },
        },
      ]
    );
  };

  const sortedAssets = [...assets].sort((a, b) => {
    if (sort === "value") {
      return (b.approxValue ?? 0) - (a.approxValue ?? 0);
    }
    if (sort === "name") {
      return a.description.localeCompare(b.description);
    }
    // recent
    return (
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  });

  // Group by category
  const grouped = ASSET_CATEGORIES.map((cat) => {
    const items = sortedAssets.filter((a) => cat.types.includes(a.assetType));
    const subtotal = items.reduce((sum, a) => sum + (a.approxValue ?? 0), 0);
    return { ...cat, items, subtotal };
  }).filter((g) => g.items.length > 0);

  const totalValue = assets.reduce((s, a) => s + (a.approxValue ?? 0), 0);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Header */}
      <View className="bg-indigo-600 px-5 pt-4 pb-8">
        <Text className="text-xl font-bold text-white">Assets</Text>
        {!loading && assets.length > 0 && (
          <Text className="text-indigo-200 text-sm mt-0.5">
            {assets.length} item{assets.length !== 1 ? "s" : ""} ·{" "}
            {formatCurrency(totalValue)} total
          </Text>
        )}
      </View>

      <View className="flex-1 -mt-4">
        <SectionIntro note="Track every financial and physical asset your household owns — bank accounts, fixed deposits, investments, property, and gold. Assign a trusted person to each so your family knows who to contact." />

        {/* Sort chips */}
        <View className="flex-row gap-2 px-4 py-3">
          {(["recent", "value", "name"] as SortKey[]).map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => setSort(key)}
              className={`rounded-full px-3 py-1.5 ${
                sort === key
                  ? "bg-indigo-600"
                  : "bg-white border border-gray-200"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  sort === key ? "text-white" : "text-gray-600"
                }`}
              >
                {key === "recent" ? "Recent" : key === "value" ? "Value" : "Name"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <LoadingState message="Loading assets..." />
        ) : assets.length === 0 ? (
          <EmptyState
            icon="wallet-outline"
            title="No assets yet"
            subtitle="Start building your financial picture by adding your first asset."
            ctaLabel="Add asset"
            onCta={() => router.push("/(app)/assets/form")}
          />
        ) : (
          <FlatList
            data={grouped}
            keyExtractor={(item) => item.label}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#4F46E5"
              />
            }
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
            renderItem={({ item: group }) => (
              <View className="mb-4">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {group.label}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {formatCurrency(group.subtotal)}
                  </Text>
                </View>
                <View
                  className="bg-white rounded-xl overflow-hidden"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.06,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  {group.items.map((asset, idx) => (
                    <View
                      key={asset.id}
                      className={idx < group.items.length - 1 ? "border-b border-gray-50" : ""}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          router.push(`/(app)/assets/form?id=${asset.id}`)
                        }
                        className="px-4 py-3.5 flex-row items-center gap-3"
                      >
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-gray-900">
                            {asset.description}
                          </Text>
                          <Text className="text-xs text-gray-500 mt-0.5">
                            {ASSET_TYPE_LABELS[asset.assetType]}
                            {asset.institution ? ` · ${asset.institution}` : ""}
                          </Text>
                          <Text className="text-xs text-gray-400 mt-0.5">
                            Updated {timeAgo(asset.updatedAt)}
                          </Text>
                        </View>
                        <View className="items-end gap-1">
                          <Text className="text-sm font-bold text-gray-900">
                            {formatCurrency(asset.approxValue, "—")}
                          </Text>
                          <View className="flex-row gap-1">
                            <TouchableOpacity
                              onPress={() =>
                                router.push(`/(app)/assets/form?id=${asset.id}`)
                              }
                              className="p-1"
                            >
                              <Ionicons
                                name="pencil-outline"
                                size={14}
                                color="#6B7280"
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleDelete(asset)}
                              className="p-1"
                            >
                              <Ionicons
                                name="trash-outline"
                                size={14}
                                color="#EF4444"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push("/(app)/assets/form")}
        className="absolute bottom-6 right-5 bg-indigo-600 rounded-2xl w-14 h-14 items-center justify-center"
        style={{
          shadowColor: "#4F46E5",
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
