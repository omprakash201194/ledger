import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { InsurancePolicy, insuranceApi, POLICY_TYPE_LABELS } from '@/api/insurance';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { Toast, useToast } from '@/components/Toast';
import { TypeBadge } from '@/components/TypeBadge';
import { CardWrap } from '@/components/CardWrap';
import { SectionIntro } from '@/components/SectionIntro';
import { timeAgo, formatCurrency, formatDate } from '@/utils/timeAgo';
import { useAppTheme } from '@/contexts/ThemeContext';
import { fmtINR } from '@/theme';

function isDueSoon(month?: number, day?: number): boolean {
  if (!month) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  let due = new Date(currentYear, month - 1, day ?? 1);
  if (due < now) due = new Date(currentYear + 1, month - 1, day ?? 1);
  const days = (due.getTime() - now.getTime()) / 86400000;
  return days <= 30;
}

export default function InsuranceScreen() {
  const router = useRouter();
  const { toast, show: showToast, hide: hideToast } = useToast();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPolicies = useCallback(async () => {
    try {
      const data = await insuranceApi.getAll();
      setPolicies(data);
    } catch {
      showToast('Failed to load insurance policies', 'error');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPolicies().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPolicies();
    setRefreshing(false);
  }, []);

  const handleDelete = (policy: InsurancePolicy) => {
    Alert.alert(
      'Delete policy',
      `Delete "${policy.insurer} – ${POLICY_TYPE_LABELS[policy.policyType]}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await insuranceApi.delete(policy.id);
              setPolicies((prev) => prev.filter((p) => p.id !== policy.id));
              showToast('Policy deleted', 'success');
            } catch {
              showToast('Failed to delete policy', 'error');
            }
          },
        },
      ]
    );
  };

  const styles = useMemo(() => StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.bg },
    header: {
      backgroundColor: theme.surf,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: theme.bdrF,
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: theme.tx },
    headerSub: { fontSize: 12, color: theme.txS, marginTop: 2 },
    addBtn: {
      backgroundColor: theme.surf3,
      borderWidth: 1,
      borderColor: theme.bdr,
      borderRadius: 9,
      padding: 9,
    },
    card: { marginBottom: 8 },
    cardContent: { padding: 14 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    cardLeft: { flex: 1 },
    cardRight: { alignItems: 'flex-end', justifyContent: 'flex-start' },
    cardTitle: { fontSize: 14, fontWeight: '700', color: theme.tx, marginTop: 6, marginBottom: 2 },
    cardSub: { fontSize: 12, color: theme.txS },
    coverValue: { fontSize: 13, fontWeight: '700', color: theme.tx },
    coverLabel: { fontSize: 10, color: theme.txM, marginTop: 1 },
    dueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingVertical: 5,
      paddingHorizontal: 8,
      borderRadius: 6,
      backgroundColor: theme.surf3,
      alignSelf: 'flex-start',
      marginBottom: 8,
    },
    dueRowUrgent: { backgroundColor: theme.highBg, borderWidth: 1, borderColor: theme.highBdr },
    dueText: { fontSize: 11, color: theme.txS },
    dueTextUrgent: { color: theme.redL, fontWeight: '600' },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: theme.bdrF,
    },
    footerLabel: { fontSize: 12, color: theme.txM },
    footerValue: { fontSize: 12, fontWeight: '600', color: theme.tx },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 10,
      paddingBottom: 10,
      gap: 6,
    },
    actionBtn: { padding: 5 },
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 20,
      backgroundColor: theme.brand,
      borderRadius: 18,
      width: 56,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.brand,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 6,
    },
  }), [theme]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Insurance</Text>
          {!loading && policies.length > 0 && (
            <Text style={styles.headerSub}>
              {policies.length} polic{policies.length !== 1 ? 'ies' : 'y'}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(app)/insurance/form')}
          style={styles.addBtn}
        >
          <Ionicons name="add" size={20} color={theme.brandL} />
        </TouchableOpacity>
      </View>

      {/* Section intro — always visible above the list/empty branch */}
      {!loading && (
        <SectionIntro
          sectionKey="insurance"
          note="Life, health, accident and general insurance policies. Include the policy document location — finding the original is often the hardest part."
        />
      )}

      {loading ? (
        <LoadingState message="Loading policies..." />
      ) : policies.length === 0 ? (
        <EmptyState
          icon="shield-outline"
          title="No policies yet"
          subtitle="Add your insurance policies to keep track of coverage for your family."
          ctaLabel="Add policy"
          onCta={() => router.push('/(app)/insurance/form')}
        />
      ) : (
        <FlatList
          data={policies}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.brandL} />
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          renderItem={({ item: policy }) => {
            const dueSoon = isDueSoon(policy.premiumDueMonth, policy.premiumDueDay);
            return (
              <CardWrap
                onPress={() => router.push(`/(app)/insurance/form?id=${policy.id}`)}
                style={styles.card}
              >
                <View style={styles.cardContent}>
                  {/* Top row */}
                  <View style={styles.cardTop}>
                    <View style={styles.cardLeft}>
                      <TypeBadge code={policy.policyType} label={POLICY_TYPE_LABELS[policy.policyType]} />
                      <Text style={styles.cardTitle}>{policy.insurer}</Text>
                      {policy.policyNumber && (
                        <Text style={styles.cardSub}>Policy: {policy.policyNumber}</Text>
                      )}
                      {policy.lifeAssured && (
                        <Text style={styles.cardSub}>Assured: {policy.lifeAssured}</Text>
                      )}
                    </View>
                    <View style={styles.cardRight}>
                      {policy.sumAssured != null && (
                        <>
                          <Text style={styles.coverValue}>{fmtINR(policy.sumAssured)}</Text>
                          <Text style={styles.coverLabel}>Cover</Text>
                        </>
                      )}
                    </View>
                  </View>

                  {/* Due date */}
                  {policy.maturityDate && (
                    <View style={[styles.dueRow, dueSoon && styles.dueRowUrgent]}>
                      <Ionicons
                        name="calendar-outline"
                        size={12}
                        color={dueSoon ? theme.redL : theme.txS}
                      />
                      <Text style={[styles.dueText, dueSoon && styles.dueTextUrgent]}>
                        Matures: {formatDate(policy.maturityDate)}
                      </Text>
                    </View>
                  )}

                  {/* Footer */}
                  {policy.premiumAmount != null && (
                    <View style={styles.footer}>
                      <Text style={styles.footerLabel}>Annual premium</Text>
                      <Text style={styles.footerValue}>{fmtINR(policy.premiumAmount)}</Text>
                    </View>
                  )}
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => router.push(`/(app)/insurance/form?id=${policy.id}`)}
                    style={styles.actionBtn}
                  >
                    <Ionicons name="pencil-outline" size={14} color={theme.txM} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(policy)} style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={14} color={theme.redL} />
                  </TouchableOpacity>
                </View>
              </CardWrap>
            );
          }}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/(app)/insurance/form')}
        style={styles.fab}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
