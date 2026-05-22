import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  TrustedPerson,
  trustedPersonsApi,
  TRUSTED_PERSON_TYPE_LABELS,
} from "@/api/trustedPersons";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { Toast, useToast } from "@/components/Toast";
import { timeAgo } from "@/utils/timeAgo";

const TYPE_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  FAMILY: { bg: "bg-teal-50", text: "text-teal-600", badge: "bg-teal-100" },
  ADVISOR: { bg: "bg-blue-50", text: "text-blue-600", badge: "bg-blue-100" },
  EXECUTOR: { bg: "bg-purple-50", text: "text-purple-600", badge: "bg-purple-100" },
};

export default function TrustedPersonsScreen() {
  const router = useRouter();
  const { toast, show: showToast, hide: hideToast } = useToast();

  const [persons, setPersons] = useState<TrustedPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPersons = useCallback(async () => {
    try {
      const data = await trustedPersonsApi.getAll();
      setPersons(data);
    } catch {
      showToast("Failed to load trusted persons", "error");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPersons().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPersons();
    setRefreshing(false);
  }, []);

  const handleDelete = (person: TrustedPerson) => {
    Alert.alert("Remove person", `Remove "${person.name}" from trusted persons?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await trustedPersonsApi.delete(person.id);
            setPersons((prev) => prev.filter((p) => p.id !== person.id));
            showToast("Person removed", "success");
          } catch {
            showToast("Failed to remove", "error");
          }
        },
      },
    ]);
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
        <LoadingState message="Loading..." />
      ) : persons.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No trusted persons"
          subtitle="Add family members, advisors, and executors who should know about your finances."
          ctaLabel="Add person"
          onCta={() => router.push("/trusted-persons/form")}
        />
      ) : (
        <FlatList
          data={persons}
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
            paddingTop: 12,
            paddingBottom: 80,
          }}
          renderItem={({ item: person }) => {
            const colors = TYPE_COLORS[person.type] ?? TYPE_COLORS.FAMILY;
            return (
              <TouchableOpacity
                onPress={() => router.push(`/trusted-persons/form?id=${person.id}`)}
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
                  <View className={`${colors.bg} rounded-full w-11 h-11 items-center justify-center`}>
                    <Text className={`${colors.text} text-lg font-bold`}>
                      {person.name[0]?.toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-0.5">
                      <Text className="text-sm font-bold text-gray-900">
                        {person.name}
                      </Text>
                      <View className="flex-row gap-1">
                        <TouchableOpacity
                          onPress={() =>
                            router.push(`/trusted-persons/form?id=${person.id}`)
                          }
                          className="p-1"
                        >
                          <Ionicons name="pencil-outline" size={14} color="#6B7280" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDelete(person)}
                          className="p-1"
                        >
                          <Ionicons name="trash-outline" size={14} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View className="flex-row gap-2 mb-1.5">
                      <View className={`${colors.badge} rounded-full px-2 py-0.5`}>
                        <Text className={`${colors.text} text-[10px] font-semibold`}>
                          {TRUSTED_PERSON_TYPE_LABELS[person.type]}
                        </Text>
                      </View>
                      {person.relationship && (
                        <Text className="text-[10px] text-gray-500 self-center">
                          {person.relationship}
                        </Text>
                      )}
                    </View>

                    <View className="flex-row gap-3">
                      {person.phone && (
                        <TouchableOpacity
                          onPress={() => Linking.openURL(`tel:${person.phone}`)}
                          className="flex-row items-center gap-1"
                        >
                          <Ionicons name="call-outline" size={13} color="#0D9488" />
                          <Text className="text-xs text-teal-600">{person.phone}</Text>
                        </TouchableOpacity>
                      )}
                      {person.email && (
                        <TouchableOpacity
                          onPress={() => Linking.openURL(`mailto:${person.email}`)}
                          className="flex-row items-center gap-1"
                        >
                          <Ionicons name="mail-outline" size={13} color="#4F46E5" />
                          <Text className="text-xs text-indigo-600">{person.email}</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {person.notes && (
                      <Text className="text-xs text-gray-500 mt-1">
                        {person.notes}
                      </Text>
                    )}
                    <Text className="text-xs text-gray-400 mt-1">
                      Added {timeAgo(person.createdAt)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <TouchableOpacity
        onPress={() => router.push("/trusted-persons/form")}
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
