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
  RecurringObligation,
  RecurringObligationInput,
  ObligationType,
  Frequency,
  RecurringActionOnDeath,
  recurringApi,
  OBLIGATION_TYPE_LABELS,
  FREQUENCY_LABELS,
  RECURRING_ACTION_LABELS,
} from "@/api/recurring";
import { FormField } from "@/components/FormField";
import { SelectField, SelectOption } from "@/components/SelectField";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Toast, useToast } from "@/components/Toast";
import { LoadingState } from "@/components/LoadingState";

const OBLIGATION_TYPE_OPTIONS: SelectOption[] = (
  [
    "LOAN_EMI",
    "SIP",
    "INSURANCE_PREMIUM",
    "SUBSCRIPTION",
    "UTILITY",
    "OTHER",
  ] as ObligationType[]
).map((t) => ({ value: t, label: OBLIGATION_TYPE_LABELS[t] }));

const FREQUENCY_OPTIONS: SelectOption[] = (
  ["MONTHLY", "QUARTERLY", "HALF_YEARLY", "YEARLY"] as Frequency[]
).map((f) => ({ value: f, label: FREQUENCY_LABELS[f] }));

const ACTION_OPTIONS: SelectOption[] = (
  ["CONTINUE", "CANCEL", "REVIEW"] as RecurringActionOnDeath[]
).map((a) => ({ value: a, label: RECURRING_ACTION_LABELS[a] }));

const DAY_OPTIONS: SelectOption[] = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

interface FormState {
  obligationType: ObligationType | "";
  payee: string;
  amount: string;
  frequency: Frequency | "";
  dueDay: string;
  paymentSource: string;
  actionOnDeath: RecurringActionOnDeath | "";
  remarks: string;
}

const EMPTY_FORM: FormState = {
  obligationType: "",
  payee: "",
  amount: "",
  frequency: "MONTHLY",
  dueDay: "",
  paymentSource: "",
  actionOnDeath: "",
  remarks: "",
};

function obligationToForm(o: RecurringObligation): FormState {
  return {
    obligationType: o.obligationType,
    payee: o.payee,
    amount: o.amount.toString(),
    frequency: o.frequency,
    dueDay: o.dueDay?.toString() ?? "",
    paymentSource: o.paymentSource ?? "",
    actionOnDeath: o.actionOnDeath ?? "",
    remarks: o.remarks ?? "",
  };
}

export default function RecurringFormScreen() {
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
    recurringApi
      .getById(id!)
      .then((o) => {
        const f = obligationToForm(o);
        setForm(f);
        setOriginal(f);
      })
      .catch(() => showToast("Failed to load obligation", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const set = useCallback(
    (key: keyof FormState) => (val: string) => setForm((f) => ({ ...f, [key]: val })),
    []
  );

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.obligationType) e.obligationType = "Type is required";
    if (!form.payee.trim()) e.payee = "Payee is required";
    if (!form.amount) e.amount = "Amount is required";
    else if (isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = "Enter a valid positive amount";
    if (!form.frequency) e.frequency = "Frequency is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: RecurringObligationInput = {
        obligationType: form.obligationType as ObligationType,
        payee: form.payee.trim(),
        amount: Number(form.amount),
        frequency: form.frequency as Frequency,
        dueDay: form.dueDay ? Number(form.dueDay) : undefined,
        paymentSource: form.paymentSource || undefined,
        actionOnDeath: (form.actionOnDeath as RecurringActionOnDeath) || undefined,
        remarks: form.remarks || undefined,
      };

      if (isEdit) {
        await recurringApi.update(id!, payload);
        showToast("Obligation updated", "success");
      } else {
        await recurringApi.create(payload);
        showToast("Obligation added", "success");
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
          {isEdit ? "Edit obligation" : "Add recurring obligation"}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className="bg-amber-500 rounded-lg px-4 py-1.5"
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
            label="Obligation type"
            required
            value={form.obligationType || undefined}
            options={OBLIGATION_TYPE_OPTIONS}
            onChange={set("obligationType")}
            error={errors.obligationType}
          />

          <FormField
            label="Payee / Recipient"
            required
            value={form.payee}
            onChangeText={set("payee")}
            placeholder="e.g. SBI Home Loan, Netflix"
            error={errors.payee}
          />

          <FormField
            label="Amount (₹)"
            required
            value={form.amount}
            onChangeText={set("amount")}
            keyboardType="numeric"
            placeholder="e.g. 25000"
            error={errors.amount}
          />

          <SelectField
            label="Frequency"
            required
            value={form.frequency || undefined}
            options={FREQUENCY_OPTIONS}
            onChange={set("frequency")}
            error={errors.frequency}
          />

          <SelectField
            label="Due day of month"
            value={form.dueDay || undefined}
            options={[{ value: "", label: "Not specified" }, ...DAY_OPTIONS]}
            onChange={set("dueDay")}
          />

          <FormField
            label="Payment source"
            value={form.paymentSource}
            onChangeText={set("paymentSource")}
            placeholder="e.g. HDFC Savings, SBI Credit Card"
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
