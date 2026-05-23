import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
} from '@/api/assets';
import { trustedPersonsApi } from '@/api/trustedPersons';
import { FormField } from '@/components/FormField';
import { SelectField, SelectOption } from '@/components/SelectField';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Toast, useToast } from '@/components/Toast';
import { LoadingState } from '@/components/LoadingState';
import { useAppTheme } from '@/contexts/ThemeContext';

const HOLDING_MODE_OPTIONS: SelectOption[] = (
  ['SINGLE', 'JOINT', 'EITHER_OR_SURVIVOR'] as HoldingMode[]
).map((h) => ({ value: h, label: HOLDING_MODE_LABELS[h] }));

interface FormState {
  assetType: AssetType | '';
  description: string;
  institution: string;
  accountNumber: string;
  holdingMode: HoldingMode | '';
  jointHolderName: string;
  trustedPersonId: string;
  approxValue: string;
  valueAsOf: string;
  maturityDate: string;
  documentLocation: string;
  remarks: string;
}

const EMPTY_FORM: FormState = {
  assetType: '',
  description: '',
  institution: '',
  accountNumber: '',
  holdingMode: 'SINGLE',
  jointHolderName: '',
  trustedPersonId: '',
  approxValue: '',
  valueAsOf: '',
  maturityDate: '',
  documentLocation: '',
  remarks: '',
};

function assetToForm(a: Asset): FormState {
  return {
    assetType: a.assetType,
    description: a.description,
    institution: a.institution ?? '',
    accountNumber: a.accountNumber ?? '',
    holdingMode: a.holdingMode,
    jointHolderName: a.jointHolderName ?? '',
    trustedPersonId: a.trustedPersonId ?? '',
    approxValue: a.approxValue?.toString() ?? '',
    valueAsOf: a.valueAsOf ?? '',
    maturityDate: a.maturityDate ?? '',
    documentLocation: a.documentLocation ?? '',
    remarks: a.remarks ?? '',
  };
}

export default function AssetFormScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useMemo(() => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  header: {
    backgroundColor: theme.surf,
    borderBottomWidth: 1,
    borderBottomColor: theme.bdrF,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: { padding: 2 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: theme.tx },
  formContent: { padding: 16, paddingBottom: 40 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.txM,
    letterSpacing: 0.8,
    marginBottom: 4,
    marginTop: 12,
  },
  fieldHint: { fontSize: 11, color: theme.txM, marginBottom: 6 },
  typeSelector: {
    backgroundColor: theme.surf3,
    borderWidth: 1,
    borderColor: theme.bdr,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 4,
  },
  catHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.txM,
    letterSpacing: 0.6,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: theme.bdrF,
  },
  typeRowSelected: {
    backgroundColor: 'rgba(61,110,158,0.15)',
  },
  typeRowText: { fontSize: 14, color: theme.txS },
  typeRowTextSelected: { color: theme.brandL, fontWeight: '600' },
  errorText: { fontSize: 11, color: theme.redL, marginBottom: 6 },
  moreToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  moreToggleText: { fontSize: 14, fontWeight: '600', color: theme.brandL },
  divider: { height: 1, backgroundColor: theme.bdrF, marginBottom: 12 },
  saveBtn: {
    backgroundColor: theme.brand,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
}), [theme]);

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
  const [showMore, setShowMore] = useState(false);

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
        showToast('Failed to load data', 'error');
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
    if (!form.assetType) e.assetType = 'Asset type is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.holdingMode) e.holdingMode = 'Holding mode is required';
    if (form.approxValue && isNaN(Number(form.approxValue)))
      e.approxValue = 'Must be a number';
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
        showToast('Asset updated', 'success');
      } else {
        await assetsApi.create(payload);
        showToast('Asset added', 'success');
      }

      setTimeout(() => router.back(), 500);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to save asset';
      showToast(msg, 'error');
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
    form.holdingMode === 'JOINT' || form.holdingMode === 'EITHER_OR_SURVIVOR';

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <LoadingState message="Loading asset..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
      <ConfirmModal
        visible={showDiscard}
        onConfirm={() => { setShowDiscard(false); router.back(); }}
        onCancel={() => setShowDiscard(false)}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.tx} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Edit Asset' : 'Add Asset'}</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Type selector — grouped */}
          <Text style={styles.fieldLabel}>TYPE</Text>
          <View style={styles.typeSelector}>
            {ASSET_CATEGORIES.map((cat) => (
              <View key={cat.label}>
                <Text style={styles.catHeader}>{cat.label.toUpperCase()}</Text>
                {cat.types.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => set('assetType')(t)}
                    style={[
                      styles.typeRow,
                      form.assetType === t && styles.typeRowSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeRowText,
                        form.assetType === t && styles.typeRowTextSelected,
                      ]}
                    >
                      {ASSET_TYPE_LABELS[t]}
                    </Text>
                    {form.assetType === t && (
                      <Ionicons name="checkmark" size={16} color={theme.brandL} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
          {errors.assetType && (
            <Text style={styles.errorText}>{errors.assetType}</Text>
          )}

          <Text style={styles.fieldLabel}>DESCRIPTION</Text>
          <Text style={styles.fieldHint}>A short name you'll recognise</Text>
          <FormField
            label=""
            value={form.description}
            onChangeText={set('description')}
            placeholder="e.g. HDFC Savings Account, Reliance MF"
            error={errors.description}
          />

          <Text style={styles.fieldLabel}>INSTITUTION / HELD WITH</Text>
          <FormField
            label=""
            value={form.institution}
            onChangeText={set('institution')}
            placeholder="e.g. HDFC Bank"
          />

          <Text style={styles.fieldLabel}>APPROXIMATE VALUE (₹)</Text>
          <FormField
            label=""
            value={form.approxValue}
            onChangeText={set('approxValue')}
            keyboardType="numeric"
            placeholder="e.g. 500000"
            error={errors.approxValue}
          />

          {/* More details toggle */}
          <TouchableOpacity
            onPress={() => setShowMore(!showMore)}
            style={styles.moreToggle}
          >
            <Text style={styles.moreToggleText}>More details</Text>
            <Ionicons
              name={showMore ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={theme.brandL}
            />
          </TouchableOpacity>

          {showMore && (
            <>
              <View style={styles.divider} />

              <SelectField
                label="Holding mode"
                required
                value={form.holdingMode || undefined}
                options={HOLDING_MODE_OPTIONS}
                onChange={set('holdingMode')}
                error={errors.holdingMode}
              />

              {showJointHolder && (
                <FormField
                  label="Joint holder name"
                  value={form.jointHolderName}
                  onChangeText={set('jointHolderName')}
                  placeholder="Name of joint holder"
                />
              )}

              <FormField
                label="Account / Folio number"
                value={form.accountNumber}
                onChangeText={set('accountNumber')}
                placeholder="Account number"
              />

              <FormField
                label="Value as of (date)"
                value={form.valueAsOf}
                onChangeText={set('valueAsOf')}
                placeholder="YYYY-MM-DD"
              />

              {showMaturity && (
                <FormField
                  label="Maturity date"
                  value={form.maturityDate}
                  onChangeText={set('maturityDate')}
                  placeholder="YYYY-MM-DD"
                />
              )}

              <SelectField
                label="Nominee / Trusted person"
                value={form.trustedPersonId || undefined}
                options={[{ value: '', label: 'None' }, ...trustedPersonOptions]}
                onChange={set('trustedPersonId')}
              />

              <FormField
                label="Location of original documents"
                value={form.documentLocation}
                onChangeText={set('documentLocation')}
                placeholder="e.g. Safe deposit box, drawer in office"
              />

              <FormField
                label="Notes"
                value={form.remarks}
                onChangeText={set('remarks')}
                placeholder="Any additional notes"
                multiline
                numberOfLines={3}
                style={{ minHeight: 80, textAlignVertical: 'top' }}
              />
            </>
          )}

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={styles.saveBtn}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.saveBtnText}>{isEdit ? 'Save changes' : 'Add asset'}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

