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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  RecurringObligation,
  recurringApi,
  OBLIGATION_TYPE_LABELS,
  FREQUENCY_LABELS,
} from '@/api/recurring';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { Toast, useToast } from '@/components/Toast';
import { CardWrap } from '@/components/CardWrap';
import { SectionIntro } from '@/components/SectionIntro';
import { formatCurrency } from '@/utils/timeAgo';
import { useAppTheme } from '@/contexts/ThemeContext';
import { fmtINR } from '@/theme';

export default function RecurringScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();

  const OBL_COLORS: Record<string, string> = {
    EMI: theme.redL,
    SIP: theme.greenL,
    INSURANCE_PREMIUM: theme.brandL,
    SUBSCRIPTION: theme.amberL,
    RENT: theme.gold,
    UTILITY: theme.txS,
    OTHER: theme.txS,
  };
  const styles = useMemo(() => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  headerBanner: {
    backgroundColor: theme.surf,
    borderBottomWidth: 1,
    borderBottomColor: theme.bdrF,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bannerLabel: { fontSize: 10, color: theme.txM, fontWeight: '600', letterSpacing: 0.8 },
  bannerValue: { fontSize: 20, fontWeight: '700', color: theme.amberL },
  card: { marginBottom: 8 },
  cardContent: { padding: 14 },
  cardRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  iconSquare: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: { flex: 1 },
  payee: { fontSize: 14, fontWeight: '600', color: theme.tx, marginBottom: 3 },
  typeLine: { fontSize: 11, color: theme.txM },
  amountCol: { alignItems: 'flex-end' },
  amount: { fontSize: 15, fontWeight: '700', color: theme.tx },
  amountSuffix: { fontSize: 11, color: theme.txM },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 8,
    gap: 4,
  },
  actionBtn: { padding: 5 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: theme.amber,
    borderRadius: 18,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.amber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
}), [theme]);

  const { toast, show: showToast, hide: hideToast } = useToast();

  const [obligations, setObligations] = useState<RecurringObligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchObligations = useCallback(async () => {
    try {
      const data = await recurringApi.getAll();
      setObligations(data);
    } catch {
      showToast('Failed to load obligations', 'error');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchObligations().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchObligations();
    setRefreshing(false);
  }, []);

  const handleDelete = (obligation: RecurringObligation) => {
    Alert.alert(
      'Delete obligation',
      `Delete "${obligation.payee}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await recurringApi.delete(obligation.id);
              setObligations((prev) => prev.filter((o) => o.id !== obligation.id));
              showToast('Obligation deleted', 'success');
            } catch {
              showToast('Failed to delete', 'error');
            }
          },
        },
      ]
    );
  };

  const monthlyTotal = obligations.reduce((sum, o) => {
    const freq = o.frequency;
    const monthly =
      freq === 'MONTHLY'
        ? o.amount
        : freq === 'QUARTERLY'
        ? o.amount / 3
        : freq === 'HALF_YEARLY'
        ? o.amount / 6
        : o.amount / 12;
    return sum + monthly;
  }, 0);

  const freqSuffix = (freq: string) => {
    if (freq === 'MONTHLY') return '/mo';
    if (freq === 'QUARTERLY') return '/qtr';
    if (freq === 'HALF_YEARLY') return '/6mo';
    return '/yr';
  };

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />

      {/* Monthly outflow header */}
      {!loading && obligations.length > 0 && (
        <View style={styles.headerBanner}>
          <Text style={styles.bannerLabel}>ESTIMATED MONTHLY OUTFLOW</Text>
          <Text style={styles.bannerValue}>{fmtINR(Math.round(monthlyTotal))}</Text>
        </View>
      )}

      {loading ? (
        <LoadingState message="Loading obligations..." />
      ) : obligations.length === 0 ? (
        <>
          <SectionIntro sectionKey="recurring" note="Auto-debits, SIPs, subscriptions and standing instructions — anything that keeps charging your account." />
          <EmptyState
            icon="repeat-outline"
            title="No recurring obligations"
            subtitle="Track your EMIs, SIPs, subscriptions, and other regular payments."
            ctaLabel="Add obligation"
            onCta={() => router.push('/recurring/form')}
          />
        </>
      ) : (
        <FlatList
          data={obligations}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <SectionIntro sectionKey="recurring" note="Auto-debits, SIPs, subscriptions and standing instructions — anything that keeps charging your account." />
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.amber} />
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          renderItem={({ item: obligation }) => {
            const color = OBL_COLORS[obligation.obligationType] ?? theme.txS;
            return (
              <CardWrap
                onPress={() => router.push(`/recurring/form?id=${obligation.id}`)}
                style={styles.card}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardRow}>
                    {/* Icon square */}
                    <View style={[styles.iconSquare, { backgroundColor: color + '22' }]}>
                      <Ionicons name="repeat-outline" size={18} color={color} />
                    </View>
                    <View style={styles.info}>
                      <Text style={styles.payee}>{obligation.payee}</Text>
                      <Text style={styles.typeLine}>
                        {OBLIGATION_TYPE_LABELS[obligation.obligationType]}
                        {' · '}
                        {FREQUENCY_LABELS[obligation.frequency]}
                      </Text>
                    </View>
                    <View style={styles.amountCol}>
                      <Text style={styles.amount}>{fmtINR(obligation.amount)}</Text>
                      <Text style={styles.amountSuffix}>{freqSuffix(obligation.frequency)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => router.push(`/recurring/form?id=${obligation.id}`)}
                    style={styles.actionBtn}
                  >
                    <Ionicons name="pencil-outline" size={13} color={theme.txM} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(obligation)} style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={13} color={theme.redL} />
                  </TouchableOpacity>
                </View>
              </CardWrap>
            );
          }}
        />
      )}

      <TouchableOpacity
        onPress={() => router.push('/recurring/form')}
        style={styles.fab}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

