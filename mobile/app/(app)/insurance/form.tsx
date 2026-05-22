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
  InsurancePolicy,
  InsurancePolicyInput,
  PolicyType,
  insuranceApi,
  POLICY_TYPE_LABELS,
} from "@/api/insurance";
import { trustedPersonsApi } from "@/api/trustedPersons";
import { FormField } from "@/components/FormField";
import { SelectField, SelectOption } from "@/components/SelectField";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Toast, useToast } from "@/components/Toast";
import { LoadingState } from "@/components/LoadingState";

const POLICY_TYPE_OPTIONS: SelectOption[] = (
  ["TERM_LIFE", "WHOLE_LIFE", "HEALTH", "VEHICLE", "PROPERTY", "OTHER"] as PolicyType[]
).map((t) => ({ value: t, label: POLICY_TYPE_LABELS[t] }));

const MONTH_OPTIONS: SelectOption[] = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2000, i).toLocaleString("default", { month: "long" }),
}));

const DAY_OPTIONS: SelectOption[] = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

interface FormState {
  policyType: PolicyType | "";
  insurer: string;
  policyNumber: string;
  lifeAssured: string;
  sumAssured: string;
  premiumAmount: string;
  premiumDueMonth: string;
  premiumDueDay: string;
  trustedPersonId: string;
  maturityDate: string;
  documentLocation: string;
  remarks: string;
}

const EMPTY_FORM: FormState = {
  policyType: "",
  insurer: "",
  policyNumber: "",
  lifeAssured: "",
  sumAssured: "",
  premiumAmount: "",
  premiumDueMonth: "",
  premiumDueDay: "",
  trustedPersonId: "",
  maturityDate: "",
  documentLocation: "",
  remarks: "",
};

function policyToForm(p: InsurancePolicy): FormState {
  return {
    policyType: p.policyType,
    insurer: p.insurer,
    policyNumber: p.policyNumber ?? "",
    lifeAssured: p.lifeAssured ?? "",
    sumAssured: p.sumAssured?.toString() ?? "",
    premiumAmount: p.premiumAmount?.toString() ?? "",
    premiumDueMonth: p.premiumDueMonth?.toString() ?? "",
    premiumDueDay: p.premiumDueDay?.toString() ?? "",
    trustedPersonId: p.trustedPersonId ?? "",
    maturityDate: p.maturityDate ?? "",
    documentLocation: p.documentLocation ?? "",
    remarks: p.remarks ?? "",
  };
}

export default function InsuranceFormScreen() {
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
  const [trustedPersonOptions, setTrustedPersonOptions] = useState<SelectOption[]>([]);

  const isDirty = JSON.stringify(form) !== JSON.stringify(original);

  useEffect(() => {
    const load = async () => {
      try {
        const [tp, policy] = await Promise.all([
          trustedPersonsApi.getAll(),
          isEdit ? insuranceApi.getById(id!) : Promise.resolve(null),
        ]);
        setTrustedPersonOptions(
          tp.map((p) => ({ value: p.id, label: `${p.name} (${p.relationship ?? p.type})` }))
        );
        if (policy) {
          const f = policyToForm(policy);
          setForm(f);
          setOriginal(f);
        } else {
          setOriginal(EMPTY_FORM);
        }
      } catch {
        showToast("Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const set = useCallback(
    (key: keyof FormState) => (val: string) => setForm((f) => ({ ...f, [key]: val })),
    []
  );

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.policyType) e.policyType = "Policy type is required";
    if (!form.insurer.trim()) e.insurer = "Insurer name is required";
    if (form.sumAssured && isNaN(Number(form.sumAssured)))
      e.sumAssured = "Must be a number";
    if (form.premiumAmount && isNaN(Number(form.premiumAmount)))
      e.premiumAmount = "Must be a number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: InsurancePolicyInput = {
        policyType: form.policyType as PolicyType,
        insurer: form.insurer.trim(),
        policyNumber: form.policyNumber || undefined,
        lifeAssured: form.lifeAssured || undefined,
        sumAssured: form.sumAssured ? Number(form.sumAssured) : undefined,
        premiumAmount: form.premiumAmount ? Number(form.premiumAmount) : undefined,
        premiumDueMonth: form.premiumDueMonth ? Number(form.premiumDueMonth) : undefined,
        premiumDueDay: form.premiumDueDay ? Number(form.premiumDueDay) : undefined,
        trustedPersonId: form.trustedPersonId || undefined,
        maturityDate: form.maturityDate || undefined,
        documentLocation: form.documentLocation || undefined,
        remarks: form.remarks || undefined,
      };

      if (isEdit) {
        await insuranceApi.update(id!, payload);
        showToast("Policy updated", "success");
      } else {
        await insuranceApi.create(payload);
        showToast("Policy added", "success");
      }
      setTimeout(() => router.back(), 500);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to save policy";
      showToast(msg, "error");
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
        <LoadingState message="Loading policy..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
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

      {/* Header */}
      <View className="bg-white border-b border-gray-100 px-4 py-3 flex-row items-center gap-3">
        <TouchableOpacity onPress={handleBack} className="p-1">
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <Text className="flex-1 text-base font-semibold text-gray-900">
          {isEdit ? "Edit policy" : "Add insurance policy"}
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
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <SelectField
            label="Policy type"
            required
            value={form.policyType || undefined}
            options={POLICY_TYPE_OPTIONS}
            onChange={set("policyType")}
            error={errors.policyType}
          />

          <FormField
            label="Insurer / Company"
            required
            value={form.insurer}
            onChangeText={set("insurer")}
            placeholder="e.g. LIC, HDFC Life, Star Health"
            error={errors.insurer}
          />

          <FormField
            label="Policy number"
            value={form.policyNumber}
            onChangeText={set("policyNumber")}
            placeholder="Policy / certificate number"
          />

          <FormField
            label="Life assured"
            value={form.lifeAssured}
            onChangeText={set("lifeAssured")}
            placeholder="Name of the person insured"
          />

          <FormField
            label="Sum assured (₹)"
            value={form.sumAssured}
            onChangeText={set("sumAssured")}
            keyboardType="numeric"
            placeholder="e.g. 1000000"
            error={errors.sumAssured}
          />

          <FormField
            label="Annual premium (₹)"
            value={form.premiumAmount}
            onChangeText={set("premiumAmount")}
            keyboardType="numeric"
            placeholder="e.g. 25000"
            error={errors.premiumAmount}
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <SelectField
                label="Premium due month"
                value={form.premiumDueMonth || undefined}
                options={[{ value: "", label: "Select month" }, ...MONTH_OPTIONS]}
                onChange={set("premiumDueMonth")}
              />
            </View>
            <View className="flex-1">
              <SelectField
                label="Premium due day"
                value={form.premiumDueDay || undefined}
                options={[{ value: "", label: "Select day" }, ...DAY_OPTIONS]}
                onChange={set("premiumDueDay")}
              />
            </View>
          </View>

          <SelectField
            label="Nominated trusted person"
            value={form.trustedPersonId || undefined}
            options={[{ value: "", label: "None" }, ...trustedPersonOptions]}
            onChange={set("trustedPersonId")}
          />

          <FormField
            label="Maturity date"
            value={form.maturityDate}
            onChangeText={set("maturityDate")}
            placeholder="YYYY-MM-DD"
          />

          <FormField
            label="Location of original documents"
            value={form.documentLocation}
            onChangeText={set("documentLocation")}
            placeholder="e.g. File cabinet, safe"
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
