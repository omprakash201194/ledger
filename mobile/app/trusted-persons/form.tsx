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
  TrustedPerson,
  TrustedPersonInput,
  TrustedPersonType,
  trustedPersonsApi,
  TRUSTED_PERSON_TYPE_LABELS,
} from "@/api/trustedPersons";
import { FormField } from "@/components/FormField";
import { SelectField, SelectOption } from "@/components/SelectField";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Toast, useToast } from "@/components/Toast";
import { LoadingState } from "@/components/LoadingState";

const TYPE_OPTIONS: SelectOption[] = (
  ["FAMILY", "ADVISOR", "EXECUTOR"] as TrustedPersonType[]
).map((t) => ({ value: t, label: TRUSTED_PERSON_TYPE_LABELS[t] }));

interface FormState {
  name: string;
  relationship: string;
  type: TrustedPersonType | "";
  phone: string;
  email: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  relationship: "",
  type: "FAMILY",
  phone: "",
  email: "",
  notes: "",
};

function personToForm(p: TrustedPerson): FormState {
  return {
    name: p.name,
    relationship: p.relationship ?? "",
    type: p.type,
    phone: p.phone ?? "",
    email: p.email ?? "",
    notes: p.notes ?? "",
  };
}

export default function TrustedPersonFormScreen() {
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
    trustedPersonsApi
      .getById(id!)
      .then((p) => {
        const f = personToForm(p);
        setForm(f);
        setOriginal(f);
      })
      .catch(() => showToast("Failed to load", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const set = useCallback(
    (key: keyof FormState) => (val: string) => setForm((f) => ({ ...f, [key]: val })),
    []
  );

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.type) e.type = "Type is required";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: TrustedPersonInput = {
        name: form.name.trim(),
        relationship: form.relationship || undefined,
        type: form.type as TrustedPersonType,
        phone: form.phone || undefined,
        email: form.email || undefined,
        notes: form.notes || undefined,
      };

      if (isEdit) {
        await trustedPersonsApi.update(id!, payload);
        showToast("Person updated", "success");
      } else {
        await trustedPersonsApi.create(payload);
        showToast("Person added", "success");
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
          {isEdit ? "Edit person" : "Add trusted person"}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className="bg-teal-600 rounded-lg px-4 py-1.5"
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
          <FormField
            label="Full name"
            required
            value={form.name}
            onChangeText={set("name")}
            placeholder="e.g. Priya Gautam"
            autoCapitalize="words"
            error={errors.name}
          />

          <SelectField
            label="Type"
            required
            value={form.type || undefined}
            options={TYPE_OPTIONS}
            onChange={set("type")}
            error={errors.type}
          />

          <FormField
            label="Relationship"
            value={form.relationship}
            onChangeText={set("relationship")}
            placeholder="e.g. Spouse, Father, CA, Lawyer"
            autoCapitalize="words"
          />

          <FormField
            label="Phone number"
            value={form.phone}
            onChangeText={set("phone")}
            placeholder="+91 9876543210"
            keyboardType="phone-pad"
          />

          <FormField
            label="Email address"
            value={form.email}
            onChangeText={set("email")}
            placeholder="their@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <FormField
            label="Notes"
            value={form.notes}
            onChangeText={set("notes")}
            placeholder="Any notes about this person's role"
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: "top" }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
