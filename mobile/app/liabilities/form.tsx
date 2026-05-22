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
  Liability,
  LiabilityInput,
  LiabilityType,
  liabilitiesApi,
  LIABILITY_TYPE_LABELS,
} from "@/api/liabilities";
import { assetsApi } from "@/api/assets";
import { FormField } from "@/components/FormField";
import { SelectField, SelectOption } from "@/components/SelectField";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Toast, useToast } from "@/components/Toast";
import { LoadingState } from "@/components/LoadingState";

const LIABILITY_TYPE_OPTIONS: SelectOption[] = (
  [
    "HOME_LOAN",
    "CAR_LOAN",
    "PERSONAL_LOAN",
    "EDUCATION_LOAN",
    "CREDIT_CARD",
    "OTHER",
  ] as LiabilityType[]
).map((t) => ({ value: t, label: LIABILITY_TYPE_LABELS[t] }));

interface FormState {
  liabilityType: LiabilityType | "";
  lender: string;
  accountNumber: string;
  originalAmount: string;
  outstandingBalance: string;
  emiAmount: string;
  tenureEndDate: string;
  linkedAssetId: string;
  remarks: string;
}

const EMPTY_FORM: FormState = {
  liabilityType: "",
  lender: "",
  accountNumber: "",
  originalAmount: "",
  outstandingBalance: "",
  emiAmount: "",
  tenureEndDate: "",
  linkedAssetId: "",
  remarks: "",
};

function liabilityToForm(l: Liability): FormState {
  return {
    liabilityType: l.liabilityType,
    lender: l.lender,
    accountNumber: l.accountNumber ?? "",
    originalAmount: l.originalAmount?.toString() ?? "",
    outstandingBalance: l.outstandingBalance?.toString() ?? "",
    emiAmount: l.emiAmount?.toString() ?? "",
    tenureEndDate: l.tenureEndDate ?? "",
    linkedAssetId: l.linkedAssetId ?? "",
    remarks: l.remarks ?? "",
  };
}

export default function LiabilityFormScreen() {
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
  const [assetOptions, setAssetOptions] = useState<SelectOption[]>([]);

  const isDirty = JSON.stringify(form) !== JSON.stringify(original);

  useEffect(() => {
    const load = async () => {
      try {
        const [assets, liability] = await Promise.all([
          assetsApi.getAll(),
          isEdit ? liabilitiesApi.getById(id!) : Promise.resolve(null),
        ]);
        setAssetOptions(
          assets.map((a) => ({ value: a.id, label: a.description }))
        );
        if (liability) {
          const f = liabilityToForm(liability);
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
    if (!form.liabilityType) e.liabilityType = "Type is required";
    if (!form.lender.trim()) e.lender = "Lender name is required";
    if (form.originalAmount && isNaN(Number(form.originalAmount)))
      e.originalAmount = "Must be a number";
    if (form.outstandingBalance && isNaN(Number(form.outstandingBalance)))
      e.outstandingBalance = "Must be a number";
    if (form.emiAmount && isNaN(Number(form.emiAmount)))
      e.emiAmount = "Must be a number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: LiabilityInput = {
        liabilityType: form.liabilityType as LiabilityType,
        lender: form.lender.trim(),
        accountNumber: form.accountNumber || undefined,
        originalAmount: form.originalAmount ? Number(form.originalAmount) : undefined,
        outstandingBalance: form.outstandingBalance
          ? Number(form.outstandingBalance)
          : undefined,
        emiAmount: form.emiAmount ? Number(form.emiAmount) : undefined,
        tenureEndDate: form.tenureEndDate || undefined,
        linkedAssetId: form.linkedAssetId || undefined,
        remarks: form.remarks || undefined,
      };

      if (isEdit) {
        await liabilitiesApi.update(id!, payload);
        showToast("Liability updated", "success");
      } else {
        await liabilitiesApi.create(payload);
        showToast("Liability added", "success");
      }
      setTimeout(() => router.back(), 500);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to save";
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
          {isEdit ? "Edit liability" : "Add liability"}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className="bg-red-600 rounded-lg px-4 py-1.5"
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
            label="Liability type"
            required
            value={form.liabilityType || undefined}
            options={LIABILITY_TYPE_OPTIONS}
            onChange={set("liabilityType")}
            error={errors.liabilityType}
          />

          <FormField
            label="Lender / Bank"
            required
            value={form.lender}
            onChangeText={set("lender")}
            placeholder="e.g. SBI, HDFC Bank, Axis Bank"
            error={errors.lender}
          />

          <FormField
            label="Account / Loan number"
            value={form.accountNumber}
            onChangeText={set("accountNumber")}
            placeholder="Account or loan reference"
          />

          <FormField
            label="Original loan amount (₹)"
            value={form.originalAmount}
            onChangeText={set("originalAmount")}
            keyboardType="numeric"
            placeholder="e.g. 3000000"
            error={errors.originalAmount}
          />

          <FormField
            label="Outstanding balance (₹)"
            value={form.outstandingBalance}
            onChangeText={set("outstandingBalance")}
            keyboardType="numeric"
            placeholder="e.g. 2500000"
            error={errors.outstandingBalance}
          />

          <FormField
            label="Monthly EMI (₹)"
            value={form.emiAmount}
            onChangeText={set("emiAmount")}
            keyboardType="numeric"
            placeholder="e.g. 25000"
            error={errors.emiAmount}
          />

          <FormField
            label="Tenure end date"
            value={form.tenureEndDate}
            onChangeText={set("tenureEndDate")}
            placeholder="YYYY-MM-DD"
          />

          <SelectField
            label="Linked asset"
            value={form.linkedAssetId || undefined}
            options={[{ value: "", label: "None" }, ...assetOptions]}
            onChange={set("linkedAssetId")}
            searchable
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
