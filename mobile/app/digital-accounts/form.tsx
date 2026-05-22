import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  DigitalAccount,
  DigitalAccountInput,
  DigitalAccountCategory,
  ActionOnDeath,
  digitalAccountsApi,
  DIGITAL_ACCOUNT_CATEGORY_LABELS,
  ACTION_ON_DEATH_LABELS,
} from "@/api/digitalAccounts";
import { FormField } from "@/components/FormField";
import { SelectField, SelectOption } from "@/components/SelectField";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Toast, useToast } from "@/components/Toast";
import { LoadingState } from "@/components/LoadingState";

const CATEGORY_OPTIONS: SelectOption[] = (
  [
    "PASSWORD_MANAGER",
    "EMAIL",
    "BANKING",
    "INVESTMENT",
    "SOCIAL_MEDIA",
    "GOVERNMENT",
    "SUBSCRIPTION",
    "OTHER",
  ] as DigitalAccountCategory[]
).map((c) => ({ value: c, label: DIGITAL_ACCOUNT_CATEGORY_LABELS[c] }));

const ACTION_OPTIONS: SelectOption[] = (
  ["TRANSFER", "ARCHIVE", "CLOSE", "MEMORIALIZE"] as ActionOnDeath[]
).map((a) => ({ value: a, label: ACTION_ON_DEATH_LABELS[a] }));

interface FormState {
  category: DigitalAccountCategory | "";
  serviceName: string;
  username: string;
  credentialLocation: string;
  twoFaMethod: string;
  recoveryContact: string;
  actionOnDeath: ActionOnDeath | "";
  remarks: string;
}

const EMPTY_FORM: FormState = {
  category: "",
  serviceName: "",
  username: "",
  credentialLocation: "",
  twoFaMethod: "",
  recoveryContact: "",
  actionOnDeath: "",
  remarks: "",
};

function accountToForm(a: DigitalAccount): FormState {
  return {
    category: a.category,
    serviceName: a.serviceName,
    username: a.username ?? "",
    credentialLocation: a.credentialLocation ?? "",
    twoFaMethod: a.twoFaMethod ?? "",
    recoveryContact: a.recoveryContact ?? "",
    actionOnDeath: a.actionOnDeath ?? "",
    remarks: a.remarks ?? "",
  };
}

export default function DigitalAccountFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const { toast, show: showToast, hide: hideToast } = useToast();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [original, setOriginal] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);

  const isDirty = JSON.stringify(form) !== JSON.stringify(original);

  useEffect(() => {
    if (!isEdit) {
      setLoading(false);
      return;
    }
    digitalAccountsApi
      .getById(id!)
      .then((account) => {
        const f = accountToForm(account);
        setForm(f);
        setOriginal(f);
      })
      .catch(() => showToast("Failed to load account", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const set = useCallback(
    (key: keyof FormState) => (val: string) => setForm((f) => ({ ...f, [key]: val })),
    []
  );

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.category) e.category = "Category is required";
    if (!form.serviceName.trim()) e.serviceName = "Service name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: DigitalAccountInput = {
        category: form.category as DigitalAccountCategory,
        serviceName: form.serviceName.trim(),
        username: form.username || undefined,
        credentialLocation: form.credentialLocation || undefined,
        twoFaMethod: form.twoFaMethod || undefined,
        recoveryContact: form.recoveryContact || undefined,
        actionOnDeath: (form.actionOnDeath as ActionOnDeath) || undefined,
        remarks: form.remarks || undefined,
      };

      if (isEdit) {
        await digitalAccountsApi.update(id!, payload);
        showToast("Account updated", "success");
      } else {
        await digitalAccountsApi.create(payload);
        showToast("Account added", "success");
      }
      setTimeout(() => router.back(), 500);
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (isDirty) setShowDiscard(true);
    else router.back();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <LoadingState message="Loading..." />
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
        onConfirm={() => { setShowDiscard(false); router.back(); }}
        onCancel={() => setShowDiscard(false)}
      />

      <View className="bg-white border-b border-gray-100 px-4 py-3 flex-row items-center gap-3">
        <TouchableOpacity onPress={handleBack} className="p-1">
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <Text className="flex-1 text-base font-semibold text-gray-900">
          {isEdit ? "Edit account" : "Add digital account"}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className="bg-blue-600 rounded-lg px-4 py-1.5"
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white text-sm font-semibold">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <SelectField
            label="Category"
            required
            value={form.category || undefined}
            options={CATEGORY_OPTIONS}
            onChange={set("category")}
            error={errors.category}
          />

          <FormField
            label="Service name"
            required
            value={form.serviceName}
            onChangeText={set("serviceName")}
            placeholder="e.g. Gmail, Netflix, HDFC NetBanking"
            error={errors.serviceName}
          />

          <FormField
            label="Username / Email"
            value={form.username}
            onChangeText={set("username")}
            placeholder="Your login username or email"
            autoCapitalize="none"
          />

          <FormField
            label="Where credentials are stored"
            value={form.credentialLocation}
            onChangeText={set("credentialLocation")}
            placeholder="e.g. 1Password, written in notebook"
          />

          <FormField
            label="2FA method"
            value={form.twoFaMethod}
            onChangeText={set("twoFaMethod")}
            placeholder="e.g. Authenticator app, SMS, email"
          />

          <FormField
            label="Recovery contact / backup"
            value={form.recoveryContact}
            onChangeText={set("recoveryContact")}
            placeholder="e.g. recovery email or phone"
            autoCapitalize="none"
          />

          <SelectField
            label="Action on death"
            value={form.actionOnDeath || undefined}
            options={[{ value: "", label: "Not specified" }, ...ACTION_OPTIONS]}
            onChange={set("actionOnDeath")}
          />

          <FormField
            label="Remarks"
            value={form.remarks}
            onChangeText={set("remarks")}
            placeholder="Any additional notes"
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: "top" }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
