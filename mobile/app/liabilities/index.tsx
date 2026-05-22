import React, { useCallback, useEffect, useState } from 'react';
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
  Liability,
  liabilitiesApi,
  LIABILITY_TYPE_LABELS,
} from '@/api/liabilities';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { Toast, useToast } from '@/components/Toast';
import { TypeBadge } from '@/components/TypeBadge';
import { CardWrap } from '@/components/CardWrap';
import { SectionIntro } from '@/components/SectionIntro';
import { timeAgo, formatCurrency, formatDate } from '@/utils/timeAgo';
import { T, fmtINR } from '@/theme';

export default function LiabilitiesScreen() {
  const router = useRouter();
  const { toast, show: showToast, hide: hideToast } = useToast();

  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLiabilities = useCallback(async () => {
    try {
      const data = await liabilitiesApi.getAll();
      setLiabilities(data);
    } catch {
      showToast('Failed to load liabilities', 'error');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchLiabilities().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLiabilities();
    setRefreshing(false);
  }, []);

  const handleDelete = (liability: Liability) => {
    Alert.alert(
      'Delete liability',
      `Delete "${liability.lender}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await liabilitiesApi.delete(liability.id);
              setLiabilities((prev) => prev.filter((l) => l.id !== liability.id));
              showToast('Liability deleted', 'success');
            } catch {
              showToast('Failed to delete', 'error');
            }
          },
        },
      ]
    );
  };

  const totalOutstanding = liabilities.reduce(
    (s, l) => s + (l.outstandingBalance ?? 0),
    0
  );

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Liabilities</Text>
        {!loading && liabilities.length > 0 && (
          <View>
            <Text style={styles.headerSubLabel}>TOTAL OUTSTANDING</Text>
            <Text style={styles.headerSubValue}>{fmtINR(totalOutstanding)}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <LoadingState message="Loading liabilities..." />
      ) : liabilities.length === 0 ? (
        <>
          <SectionIntro note="All outstanding loans and dues. Recording these protects your family from surprise demands." />
          <EmptyState
            icon="trending-down-outline"
            title="No liabilities"
            subtitle="Add loans, credit cards, or other debts to track what you owe."
            ctaLabel="Add liability"
            onCta={() => router.push('/liabilities/form')}
          />
        </>
      ) : (
        <FlatList
          data={liabilities}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <SectionIntro note="All outstanding loans and dues — home loan, car loan, personal loan, credit card balances, money you've borrowed from family." />
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.redL} />
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          renderItem={({ item: liability }) => (
            <CardWrap
              onPress={() => router.push(`/liabilities/form?id=${liability.id}`)}
              style={styles.card}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <View style={styles.cardLeft}>
                    <TypeBadge code={liability.liabilityType} label={LIABILITY_TYPE_LABELS[liability.liabilityType]} />
                    <Text style={styles.lender}>{liability.lender}</Text>
                    {liability.lender && (
                      <Text style={styles.lenderSub}>Lender</Text>
                    )}
                  </View>
                  <View style={styles.cardRight}>
                    {liability.outstandingBalance != null && (
                      <>
                        <Text style={styles.outstandingValue}>{fmtINR(liability.outstandingBalance)}</Text>
                        <Text style={styles.outstandingLabel}>outstanding</Text>
                      </>
                    )}
                  </View>
                </View>

                {/* Footer row */}
                <View style={styles.footer}>
                  {liability.emiAmount != null && (
                    <View style={styles.footerItem}>
                      <Text style={styles.footerLabel}>EMI/mo</Text>
                      <Text style={styles.footerValue}>{fmtINR(liability.emiAmount)}</Text>
                    </View>
                  )}
                  {liability.tenureEndDate && (
                    <View style={styles.footerItem}>
                      <Text style={styles.footerLabel}>Ends</Text>
                      <Text style={styles.footerValue}>{formatDate(liability.tenureEndDate)}</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => router.push(`/liabilities/form?id=${liability.id}`)}
                  style={styles.actionBtn}
                >
                  <Ionicons name="pencil-outline" size={13} color={T.txM} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(liability)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={13} color={T.redL} />
                </TouchableOpacity>
              </View>
            </CardWrap>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/liabilities/form')}
        style={styles.fab}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  header: {
    backgroundColor: T.surf,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: T.bdrF,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: T.tx, marginBottom: 4 },
  headerSubLabel: { fontSize: 10, color: T.txM, fontWeight: '600', letterSpacing: 0.8 },
  headerSubValue: { fontSize: 18, fontWeight: '700', color: T.redL },
  card: { marginBottom: 8 },
  cardContent: { padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardLeft: { flex: 1 },
  cardRight: { alignItems: 'flex-end' },
  lender: { fontSize: 14, fontWeight: '700', color: T.tx, marginTop: 6 },
  lenderSub: { fontSize: 11, color: T.txM, marginTop: 1 },
  outstandingValue: { fontSize: 16, fontWeight: '700', color: T.redL },
  outstandingLabel: { fontSize: 10, color: T.txM, marginTop: 2 },
  footer: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: T.bdrF,
  },
  footerItem: {},
  footerLabel: { fontSize: 10, color: T.txM, marginBottom: 2 },
  footerValue: { fontSize: 12, fontWeight: '600', color: T.tx },
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
    backgroundColor: T.red,
    borderRadius: 18,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: T.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
});
