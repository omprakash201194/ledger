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
  Asset,
  AssetInput,
  AssetType,
  HoldingMode,
  assetsApi,
  ASSET_TYPE_LABELS,
  ASSET_CATEGORIES,
  MATURITY_ASSET_TYPES,
  HOLDING_MODE_LABELS,
} from "@/api/assets";
import { trustedPersonsApi } from "@/api/trustedPersons";
import { FormField } from "@/components/FormField";
import { SelectField, SelectOption } from "@/components/SelectField";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Toast, useToast } from "@/components/Toast";
import { LoadingState } from "@/components/LoadingState";

const ASSET_TYPE_OPTIONS: SelectOption[] = ASSET_CATEGORIES.flatMap((cat) =>
  cat.types.map((t) => ({ value: t, label: ASSET_TYPE_LABELS[t] }))
);

const HOLDING_MODE_OPTIONS: SelectOption[] = (
  ["SINGLE", "JOINT", "EITHER_OR_SURVIVOR"] as HoldingMode[]
).map((h) => ({ value: h, label: HOLDING_MODE_LABELS[h] }));

interface FormState {
  assetType: AssetType | "";
  description: string;
  institution: string;
  accountNumber: string;
  holdingMode: HoldingMode | "";
  jointHolderName: string;
  trustedPersonId: string;
  approxValue: string;
  valueAsOf: string;
  maturityDate: string;
  documentLocation: string;
  remarks: string;
}

const EMPTY_FORM: FormState = {
  assetType: "",
  description: "",
  institution: "",
  accountNumber: "",
  holdingMode: "SINGLE",
  jointHolderName: "",
  trustedPersonId: "",
  approxValue: "",
  valueAsOf: "",
  maturityDate: "",
  documentLocation: "",
  remarks: "",
};

function assetToForm(a: Asset): FormState {
  return {
    assetType: a.assetType,
    description: a.description,
    institution: a.institution ?? "",
    accountNumber: a.accountNumber ?? "",
    holdingMode: a.holdingMode,
    jointHolderName: a.jointHolderName ?? "",
    trustedPersonId: a.trustedPersonId ?? "",
    approxValue: a.approxValue?.toString() ?? "",
    valueAsOf: a.valueAsOf ?? "",
    maturityDate: a.maturityDate ?? "",
    documentLocation: a.documentLocation ?? "",
    remarks: a.remarks ?? "",
  };
}

export default function AssetFormScreen() {
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
    const loadData = async () => {
      try {
        const [tp, asset] = await Promise.all([
          trustedPersonsApi.getAll(),
          isEdit ? assetsApi.getById(id!) : Promise.resolve(null),
        ]);
        setTrustedPersonOptions(
          tp.map((p) => ({ value: p.id, label: `${p.name} (${p.relationship ?? p.type})` }))
        );
        if (asset) {
          const f = assetToForm(asset);
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
    loadData();
  }, [id]);

  const set = useCallback(
    (key: keyof FormState) => (val: string) => setForm((f) => ({ ...f, [key]: val })),
    []
  );

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.assetType) e.assetType = "Asset type is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.holdingMode) e.holdingMode = "Holding mode is required";
    if (form.approxValue && isNaN(Number(form.approxValue)))
      e.approxValue = "Must be a number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: AssetInput = {
        assetType: form.assetType as AssetType,
        description: form.description.trim(),
        institution: form.institution || undefined,
        accountNumber: form.accountNumber || undefined,
        holdingMode: form.holdingMode as HoldingMode,
        jointHolderName: form.jointHolderName || undefined,
        trustedPersonId: form.trustedPersonId || undefined,
        approxValue: form.approxValue ? Number(form.approxValue) : undefined,
        valueAsOf: form.valueAsOf || undefined,
        maturityDate: form.maturityDate || undefined,
        documentLocation: form.documentLocation || undefined,
        remarks: form.remarks || undefined,
      };

      if (isEdit) {
        await assetsApi.update(id!, payload);
        showToast("Asset updated", "success");
      } else {
        await assetsApi.create(payload);
        showToast("Asset added", "success");
      }

      setTimeout(() => router.back(), 500);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to save asset";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (isDirty) {
      setShowDiscard(true);
    } else {
      router.back();
    }
  };

  const showMaturity =
    form.assetType &&
    MATURITY_ASSET_TYPES.includes(form.assetType as AssetType);
  const showJointHolder =
    form.holdingMode === "JOINT" || form.holdingMode === "EITHER_OR_SURVIVOR";

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <LoadingState message="Loading asset..." />
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
        onConfirm={() => {
          setShowDiscard(false);
          router.back();
        }}
        onCancel={() => setShowDiscard(false)}
      />

      {/* Header */}
      <View className="bg-white border-b border-gray-100 px-4 py-3 flex-row items-center gap-3">
        <TouchableOpacity onPress={handleBack} className="p-1">
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <Text className="flex-1 text-base font-semibold text-gray-900">
          {isEdit ? "Edit asset" : "Add asset"}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className="bg-indigo-600 rounded-lg px-4 py-1.5"
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
            label="Asset type"
            required
            value={form.assetType || undefined}
            options={ASSET_TYPE_OPTIONS}
            onChange={set("assetType")}
            error={errors.assetType}
            searchable
          />

          <FormField
            label="Description"
            required
            value={form.description}
            onChangeText={set("description")}
            placeholder="e.g. HDFC Savings Account, Reliance MF"
            error={errors.description}
          />

          <FormField
            label="Institution / Bank"
            value={form.institution}
            onChangeText={set("institution")}
            placeholder="e.g. HDFC Bank"
          />

          <FormField
            label="Account / Policy number"
            value={form.accountNumber}
            onChangeText={set("accountNumber")}
            placeholder="Account number"
          />

          <SelectField
            label="Holding mode"
            required
            value={form.holdingMode || undefined}
            options={HOLDING_MODE_OPTIONS}
            onChange={set("holdingMode")}
            error={errors.holdingMode}
          />

          {showJointHolder && (
            <FormField
              label="Joint holder name"
              value={form.jointHolderName}
              onChangeText={set("jointHolderName")}
              placeholder="Name of joint holder"
            />
          )}

          <SelectField
            label="Nominated trusted person"
            value={form.trustedPersonId || undefined}
            options={[
              { value: "", label: "None" },
              ...trustedPersonOptions,
            ]}
            onChange={set("trustedPersonId")}
          />

          <FormField
            label="Approximate value (₹)"
            value={form.approxValue}
            onChangeText={set("approxValue")}
            keyboardType="numeric"
            placeholder="e.g. 500000"
            error={errors.approxValue}
          />

          <FormField
            label="Value as of (date)"
            value={form.valueAsOf}
            onChangeText={set("valueAsOf")}
            placeholder="YYYY-MM-DD"
          />

          {showMaturity && (
            <FormField
              label="Maturity date"
              value={form.maturityDate}
              onChangeText={set("maturityDate")}
              placeholder="YYYY-MM-DD"
            />
          )}

          <FormField
            label="Location of original documents"
            value={form.documentLocation}
            onChangeText={set("documentLocation")}
            placeholder="e.g. Safe deposit box, drawer in office"
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
