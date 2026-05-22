import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  WillRecord,
  WillRecordInput,
  WillType,
  willApi,
  WILL_TYPE_LABELS,
} from "@/api/will";
import { trustedPersonsApi } from "@/api/trustedPersons";
import { FormField } from "@/components/FormField";
import { SelectField, SelectOption } from "@/components/SelectField";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Toast, useToast } from "@/components/Toast";
import { LoadingState } from "@/components/LoadingState";
import { formatDate, timeAgo } from "@/utils/timeAgo";

const WILL_TYPE_OPTIONS: SelectOption[] = (
  ["SINGLE", "JOINT", "NONE"] as WillType[]
).map((t) => ({ value: t, label: WILL_TYPE_LABELS[t] }));

interface FormState {
  hasWill: boolean;
  willType: WillType | "";
  location: string;
  executorId: string;
  registeredWith: string;
  reviewReminderDate: string;
  notes: string;
}

function willToForm(w: WillRecord): FormState {
  return {
    hasWill: w.hasWill,
    willType: w.willType ?? "",
    location: w.location ?? "",
    executorId: w.executorId ?? "",
    registeredWith: w.registeredWith ?? "",
    reviewReminderDate: w.reviewReminderDate ?? "",
    notes: w.notes ?? "",
  };
}

export default function WillScreen() {
  const { toast, show: showToast, hide: hideToast } = useToast();

  const [will, setWill] = useState<WillRecord | null>(null);
  const [form, setForm] = useState<FormState>({
    hasWill: false,
    willType: "",
    location: "",
    executorId: "",
    registeredWith: "",
    reviewReminderDate: "",
    notes: "",
  });
  const [original, setOriginal] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [executorOptions, setExecutorOptions] = useState<SelectOption[]>([]);

  const isDirty = original !== null && JSON.stringify(form) !== JSON.stringify(original);

  const loadData = useCallback(async () => {
    try {
      const [willData, persons] = await Promise.all([
        willApi.get().catch(() => null),
        trustedPersonsApi.getAll(),
      ]);
      setExecutorOptions(
        persons.map((p) => ({ value: p.id, label: `${p.name} (${p.relationship ?? p.type})` }))
      );
      if (willData) {
        setWill(willData);
        const f = willToForm(willData);
        setForm(f);
        setOriginal(f);
      } else {
        setOriginal(form);
      }
    } catch {
      showToast("Failed to load Will data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const set = useCallback(
    (key: keyof FormState) => (val: string) =>
      setForm((f) => ({ ...f, [key]: val })),
    []
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: WillRecordInput = {
        hasWill: form.hasWill,
        willType: (form.willType as WillType) || undefined,
        location: form.location || undefined,
        executorId: form.executorId || undefined,
        registeredWith: form.registeredWith || undefined,
        reviewReminderDate: form.reviewReminderDate || undefined,
        notes: form.notes || undefined,
      };
      const updated = await willApi.upsert(payload);
      setWill(updated);
      const f = willToForm(updated);
      setForm(f);
      setOriginal(f);
      showToast("Will record saved", "success");
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <LoadingState message="Loading Will record..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
      <ConfirmModal
        visible={showDiscard}
        onConfirm={() => {
          setShowDiscard(false);
          if (original) setForm(original);
        }}
        onCancel={() => setShowDiscard(false)}
        title="Discard changes?"
        confirmLabel="Discard"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Status info */}
          {will && (
            <View className="bg-indigo-50 rounded-xl p-4 mb-4 flex-row items-center gap-3">
              <Ionicons name="information-circle-outline" size={20} color="#4F46E5" />
              <View className="flex-1">
                <Text className="text-xs text-indigo-600 font-semibold">
                  Last updated {timeAgo(will.updatedAt)}
                </Text>
                {will.reviewReminderDate && (
                  <Text className="text-xs text-indigo-500">
                    Review reminder: {formatDate(will.reviewReminderDate)}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Has Will toggle */}
          <View className="bg-white rounded-xl p-4 mb-4 flex-row items-center justify-between"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                I have a Will
              </Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                Toggle on if you have a Will in place
              </Text>
            </View>
            <Switch
              value={form.hasWill}
              onValueChange={(val) => setForm((f) => ({ ...f, hasWill: val }))}
              trackColor={{ false: "#E5E7EB", true: "#A5B4FC" }}
              thumbColor={form.hasWill ? "#4F46E5" : "#9CA3AF"}
            />
          </View>

          {!form.hasWill && (
            <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="warning-outline" size={18} color="#D97706" />
                <Text className="text-sm font-semibold text-amber-800">
                  Why a Will matters
                </Text>
              </View>
              <Text className="text-xs text-amber-700 leading-5">
                Without a Will, your assets may not go to the people you intend.
                A Will ensures your wishes are legally documented and your family
                is protected. Consider consulting a lawyer to draft one.
              </Text>
            </View>
          )}

          {form.hasWill && (
            <>
              <View
                className="bg-white rounded-xl p-4 mb-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text className="text-sm font-semibold text-gray-700 mb-3">
                  Will details
                </Text>

                <SelectField
                  label="Will type"
                  value={form.willType || undefined}
                  options={[
                    { value: "", label: "Not specified" },
                    ...WILL_TYPE_OPTIONS,
                  ]}
                  onChange={set("willType")}
                />

                <FormField
                  label="Location of original Will"
                  value={form.location}
                  onChangeText={set("location")}
                  placeholder="e.g. Safe deposit box at SBI, Advocate's office"
                />

                <FormField
                  label="Registered with"
                  value={form.registeredWith}
                  onChangeText={set("registeredWith")}
                  placeholder="e.g. Sub-Registrar office, SRO Koramangala"
                />
              </View>

              <View
                className="bg-white rounded-xl p-4 mb-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text className="text-sm font-semibold text-gray-700 mb-3">
                  Executor
                </Text>

                <SelectField
                  label="Executor (trusted person)"
                  value={form.executorId || undefined}
                  options={[
                    { value: "", label: "None" },
                    ...executorOptions,
                  ]}
                  onChange={set("executorId")}
                />
              </View>

              <View
                className="bg-white rounded-xl p-4 mb-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text className="text-sm font-semibold text-gray-700 mb-3">
                  Review reminder
                </Text>

                <FormField
                  label="Review reminder date"
                  value={form.reviewReminderDate}
                  onChangeText={set("reviewReminderDate")}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </>
          )}

          <View
            className="bg-white rounded-xl p-4 mb-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <FormField
              label="Notes"
              value={form.notes}
              onChangeText={set("notes")}
              placeholder="Any additional notes about your Will"
              multiline
              numberOfLines={4}
              style={{ minHeight: 100, textAlignVertical: "top" }}
            />
          </View>

          {isDirty && (
            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity
                onPress={() => setShowDiscard(true)}
                className="flex-1 border border-gray-300 rounded-xl py-3.5 items-center"
              >
                <Text className="text-sm font-medium text-gray-700">
                  Discard
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="flex-1 bg-indigo-600 rounded-xl py-3.5 items-center"
              >
                {saving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white text-sm font-semibold">
                    Save changes
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {!isDirty && (
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="bg-indigo-600 rounded-xl py-3.5 items-center mb-4"
            >
              {saving ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white text-sm font-semibold">
                  {will ? "Update Will record" : "Save Will record"}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
