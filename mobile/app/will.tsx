import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  WillRecord,
  WillRecordInput,
  WillType,
  willApi,
  WILL_TYPE_LABELS,
} from '@/api/will';
import { trustedPersonsApi } from '@/api/trustedPersons';
import { FormField } from '@/components/FormField';
import { SelectField, SelectOption } from '@/components/SelectField';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Toast, useToast } from '@/components/Toast';
import { LoadingState } from '@/components/LoadingState';
import { SectionIntro } from '@/components/SectionIntro';
import { formatDate, timeAgo } from '@/utils/timeAgo';
import { T } from '@/theme';

const WILL_TYPE_OPTIONS: SelectOption[] = (
  ['SINGLE', 'JOINT', 'NONE'] as WillType[]
).map((t) => ({ value: t, label: WILL_TYPE_LABELS[t] }));

interface FormState {
  hasWill: boolean;
  willType: WillType | '';
  location: string;
  executorId: string;
  registeredWith: string;
  reviewReminderDate: string;
  notes: string;
}

function willToForm(w: WillRecord): FormState {
  return {
    hasWill: w.hasWill,
    willType: w.willType ?? '',
    location: w.location ?? '',
    executorId: w.executorId ?? '',
    registeredWith: w.registeredWith ?? '',
    reviewReminderDate: w.reviewReminderDate ?? '',
    notes: w.notes ?? '',
  };
}

export default function WillScreen() {
  const { toast, show: showToast, hide: hideToast } = useToast();

  const [will, setWill] = useState<WillRecord | null>(null);
  const [form, setForm] = useState<FormState>({
    hasWill: false,
    willType: '',
    location: '',
    executorId: '',
    registeredWith: '',
    reviewReminderDate: '',
    notes: '',
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
      showToast('Failed to load Will data', 'error');
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
      showToast('Will record saved', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <LoadingState message="Loading Will record..." />
      </SafeAreaView>
    );
  }

  // Should we show review reminder box?
  const reviewOverdue = will?.reviewReminderDate
    ? new Date(will.reviewReminderDate) < new Date()
    : false;

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
      <ConfirmModal
        visible={showDiscard}
        onConfirm={() => { setShowDiscard(false); if (original) setForm(original); }}
        onCancel={() => setShowDiscard(false)}
        title="Discard changes?"
        confirmLabel="Discard"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <SectionIntro note="Where your Will is kept, who your executor is, and the basic facts about it. If you don't yet have a Will, this section can act as a reminder. Indian succession law treats a registered Will as the definitive instruction; nominations alone are not enough." />

          {/* Status card */}
          {will && form.hasWill && (
            <View style={styles.statusCard}>
              <View style={[styles.statusIcon, { backgroundColor: T.gold + '22' }]}>
                <Ionicons name="checkmark-circle-outline" size={24} color={T.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statusTitle}>Will is recorded</Text>
                <Text style={styles.statusSub}>
                  Last updated {timeAgo(will.updatedAt)}
                </Text>
              </View>
            </View>
          )}

          {/* Will details (read-only view when saved) */}
          {will && form.hasWill && (
            <View style={styles.detailsCard}>
              {[
                { label: 'Executor', value: form.executorId ? executorOptions.find(o => o.value === form.executorId)?.label ?? '—' : '—' },
                { label: 'Last reviewed', value: will.updatedAt ? formatDate(will.updatedAt) : '—' },
                { label: 'Stored at', value: form.location || '—' },
                { label: 'Status', value: form.registeredWith ? `Registered with ${form.registeredWith}` : 'Not registered' },
              ].map((row, i, arr) => (
                <View
                  key={row.label}
                  style={[styles.detailRow, i < arr.length - 1 && styles.detailRowBorder]}
                >
                  <Text style={styles.detailLabel}>{row.label}</Text>
                  <Text style={styles.detailValue}>{row.value}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Review reminder */}
          {will && form.hasWill && reviewOverdue && (
            <View style={styles.reviewBox}>
              <Ionicons name="time-outline" size={18} color={T.medTx} />
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewTitle}>Review recommended</Text>
                <Text style={styles.reviewBody}>
                  Your Will review date has passed. Review and update it to ensure it reflects your current wishes.
                </Text>
                <TouchableOpacity onPress={handleSave} style={styles.reviewBtn}>
                  <Text style={styles.reviewBtnText}>Mark as reviewed</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Has Will toggle */}
          <View style={styles.toggleCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>I have a Will</Text>
              <Text style={styles.toggleSub}>Toggle on if you have a Will in place</Text>
            </View>
            <Switch
              value={form.hasWill}
              onValueChange={(val) => setForm((f) => ({ ...f, hasWill: val }))}
              trackColor={{ false: T.bdr, true: T.brand }}
              thumbColor={form.hasWill ? T.brandL : T.txM}
            />
          </View>

          {!form.hasWill && (
            <View style={styles.whyWillBox}>
              <View style={styles.whyWillHeader}>
                <Ionicons name="warning-outline" size={16} color={T.amberL} />
                <Text style={styles.whyWillTitle}>Why a Will matters</Text>
              </View>
              <Text style={styles.whyWillBody}>
                Without a Will, your assets may not go to the people you intend. A Will ensures your wishes are legally documented and your family is protected. Consider consulting a lawyer to draft one.
              </Text>
            </View>
          )}

          {form.hasWill && (
            <>
              <SelectField
                label="Will type"
                value={form.willType || undefined}
                options={[{ value: '', label: 'Not specified' }, ...WILL_TYPE_OPTIONS]}
                onChange={set('willType')}
              />

              <FormField
                label="Location of original Will"
                value={form.location}
                onChangeText={set('location')}
                placeholder="e.g. Safe deposit box at SBI, Advocate's office"
              />

              <FormField
                label="Registered with"
                value={form.registeredWith}
                onChangeText={set('registeredWith')}
                placeholder="e.g. Sub-Registrar office, SRO Koramangala"
              />

              <SelectField
                label="Executor (trusted person)"
                value={form.executorId || undefined}
                options={[{ value: '', label: 'None' }, ...executorOptions]}
                onChange={set('executorId')}
              />

              <FormField
                label="Review reminder date"
                value={form.reviewReminderDate}
                onChangeText={set('reviewReminderDate')}
                placeholder="YYYY-MM-DD"
              />
            </>
          )}

          <FormField
            label="Notes"
            value={form.notes}
            onChangeText={set('notes')}
            placeholder="Any additional notes about your Will"
            multiline
            numberOfLines={4}
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />

          {isDirty && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => setShowDiscard(true)}
                style={styles.discardBtn}
              >
                <Text style={styles.discardBtnText}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                style={styles.saveBtn}
              >
                {saving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save changes</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {!isDirty && (
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={styles.saveBtnFull}
            >
              {saving ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>
                  {will ? 'Update Will record' : 'Save Will record'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  scrollContent: { padding: 16, paddingBottom: 40 },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: T.surf2,
    borderWidth: 1,
    borderColor: T.bdr,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: { fontSize: 15, fontWeight: '700', color: T.tx },
  statusSub: { fontSize: 12, color: T.txS, marginTop: 2 },
  detailsCard: {
    backgroundColor: T.surf2,
    borderWidth: 1,
    borderColor: T.bdr,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: T.bdrF },
  detailLabel: { fontSize: 13, color: T.txM },
  detailValue: { fontSize: 13, fontWeight: '600', color: T.tx },
  reviewBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: T.medBg,
    borderWidth: 1,
    borderColor: T.medBdr,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  reviewTitle: { fontSize: 14, fontWeight: '700', color: T.tx, marginBottom: 4 },
  reviewBody: { fontSize: 12, color: T.txS, lineHeight: 17 },
  reviewBtn: {
    marginTop: 10,
    backgroundColor: T.amber,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  reviewBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  toggleCard: {
    backgroundColor: T.surf2,
    borderWidth: 1,
    borderColor: T.bdr,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleTitle: { fontSize: 15, fontWeight: '600', color: T.tx },
  toggleSub: { fontSize: 12, color: T.txM, marginTop: 2 },
  whyWillBox: {
    backgroundColor: T.medBg,
    borderWidth: 1,
    borderColor: T.medBdr,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  whyWillHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  whyWillTitle: { fontSize: 13, fontWeight: '700', color: T.amberL },
  whyWillBody: { fontSize: 12, color: T.txS, lineHeight: 18 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  discardBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: T.bdr,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  discardBtnText: { fontSize: 14, fontWeight: '600', color: T.txS },
  saveBtn: {
    flex: 1,
    backgroundColor: T.brand,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnFull: {
    backgroundColor: T.brand,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
