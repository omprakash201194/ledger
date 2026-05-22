import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Asset,
  assetsApi,
  ASSET_TYPE_LABELS,
  ASSET_CATEGORIES,
} from '@/api/assets';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { Toast, useToast } from '@/components/Toast';
import { TypeBadge } from '@/components/TypeBadge';
import { CardWrap } from '@/components/CardWrap';
import { SectionIntro } from '@/components/SectionIntro';
import { timeAgo, formatCurrency } from '@/utils/timeAgo';
import { T, CC, assetMeta, fmtINR } from '@/theme';

type SortKey = 'value' | 'name' | 'recent';
const FILTER_CATS = ['All', 'Bank', 'Retirement', 'Investments', 'Physical'];

function isStale(updatedAt: string): boolean {
  const days = (Date.now() - new Date(updatedAt).getTime()) / 86400000;
  return days > 60;
}

export default function AssetsScreen() {
  const router = useRouter();
  const { toast, show: showToast, hide: hideToast } = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState<SortKey>('recent');
  const [filterCat, setFilterCat] = useState('All');

  const fetchAssets = useCallback(async () => {
    try {
      const data = await assetsApi.getAll();
      setAssets(data);
    } catch {
      showToast('Failed to load assets', 'error');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchAssets().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAssets();
    setRefreshing(false);
  }, []);

  const handleDelete = (asset: Asset) => {
    Alert.alert(
      'Delete asset',
      `Delete "${asset.description}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await assetsApi.delete(asset.id);
              setAssets((prev) => prev.filter((a) => a.id !== asset.id));
              showToast('Asset deleted', 'success');
            } catch {
              showToast('Failed to delete asset', 'error');
            }
          },
        },
      ]
    );
  };

  const sortedAssets = [...assets].sort((a, b) => {
    if (sort === 'value') return (b.approxValue ?? 0) - (a.approxValue ?? 0);
    if (sort === 'name') return a.description.localeCompare(b.description);
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const filteredAssets = filterCat === 'All'
    ? sortedAssets
    : sortedAssets.filter((a) => (assetMeta[a.assetType]?.cat ?? 'Other') === filterCat);

  const grouped = ASSET_CATEGORIES.map((cat) => {
    const items = filteredAssets.filter((a) => cat.types.includes(a.assetType));
    const subtotal = items.reduce((sum, a) => sum + (a.approxValue ?? 0), 0);
    return { ...cat, items, subtotal };
  }).filter((g) => g.items.length > 0);

  const totalValue = assets.reduce((s, a) => s + (a.approxValue ?? 0), 0);
  const nomineeWarnings = assets.filter((a) => !a.trustedPersonId).length;

  const ListHeader = () => (
    <View>
      <SectionIntro note="Everything you own that has financial value — bank accounts, deposits, mutual funds, demat holdings, property, gold, vehicles. If something can be inherited or claimed, it belongs here." />
      {nomineeWarnings > 0 && (
        <View style={styles.warningBanner}>
          <Ionicons name="person-remove-outline" size={15} color={T.redL} />
          <Text style={styles.warningText}>
            {nomineeWarnings} asset{nomineeWarnings !== 1 ? 's' : ''} missing nominee
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />

      {/* Screen header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Assets</Text>
          {!loading && assets.length > 0 && (
            <Text style={styles.headerSub}>{fmtINR(totalValue)} total</Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(app)/assets/form')}
          style={styles.addBtn}
        >
          <Ionicons name="add" size={20} color={T.brandL} />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTER_CATS.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setFilterCat(cat)}
            style={[styles.chip, filterCat === cat && styles.chipActive]}
          >
            <Text style={[styles.chipText, filterCat === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.sortSep} />
        {(['recent', 'value', 'name'] as SortKey[]).map((key) => (
          <TouchableOpacity
            key={key}
            onPress={() => setSort(key)}
            style={[styles.chip, sort === key && styles.chipSort]}
          >
            <Text style={[styles.chipText, sort === key && styles.chipTextActive]}>
              {key === 'recent' ? 'Recent' : key === 'value' ? 'Value' : 'Name'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <LoadingState message="Loading assets..." />
      ) : assets.length === 0 ? (
        <EmptyState
          icon="wallet-outline"
          title="No assets yet"
          subtitle="Start building your financial picture by adding your first asset."
          ctaLabel="Add asset"
          onCta={() => router.push('/(app)/assets/form')}
        />
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(item) => item.label}
          ListHeaderComponent={<ListHeader />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.brandL} />
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          renderItem={({ item: group }) => (
            <View style={styles.groupBlock}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupLabel}>
                  {group.label.toUpperCase()} · {group.items.length}
                </Text>
                <Text style={styles.groupTotal}>{fmtINR(group.subtotal)}</Text>
              </View>
              {group.items.map((asset) => {
                const meta = assetMeta[asset.assetType];
                const cat = meta?.cat ?? 'Other';
                const stale = isStale(asset.updatedAt);
                const noNominee = !asset.trustedPersonId;
                return (
                  <CardWrap
                    key={asset.id}
                    onPress={() => router.push(`/(app)/assets/form?id=${asset.id}`)}
                    style={styles.assetCard}
                  >
                    <View style={styles.assetRow}>
                      <View style={styles.assetLeft}>
                        <View style={styles.assetBadgeRow}>
                          <TypeBadge code={cat} label={meta?.label ?? asset.assetType} />
                          {noNominee && (
                            <View style={styles.nomineeWarn}>
                              <Text style={styles.nomineeWarnText}>NO NOMINEE</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.assetDesc}>{asset.description}</Text>
                        {asset.institution && (
                          <Text style={styles.assetInst}>{asset.institution}</Text>
                        )}
                        {asset.maturityDate && (
                          <View style={styles.maturityRow}>
                            <Ionicons name="time-outline" size={11} color={T.txM} />
                            <Text style={styles.maturityText}>Matures {asset.maturityDate}</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.assetRight}>
                        <Text style={styles.assetValue}>
                          {asset.approxValue != null ? fmtINR(asset.approxValue) : '—'}
                        </Text>
                        <Text style={[styles.assetAge, stale && styles.assetAgeStale]}>
                          {timeAgo(asset.updatedAt)}
                        </Text>
                        <View style={styles.assetActions}>
                          <TouchableOpacity
                            onPress={() => router.push(`/(app)/assets/form?id=${asset.id}`)}
                            style={styles.actionBtn}
                          >
                            <Ionicons name="pencil-outline" size={13} color={T.txM} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDelete(asset)}
                            style={styles.actionBtn}
                          >
                            <Ionicons name="trash-outline" size={13} color={T.redL} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </CardWrap>
                );
              })}
            </View>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/(app)/assets/form')}
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
    paddingTop: 14,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: T.bdrF,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: T.tx },
  headerSub: { fontSize: 12, color: T.txS, marginTop: 2 },
  addBtn: {
    backgroundColor: T.surf3,
    borderWidth: 1,
    borderColor: T.bdr,
    borderRadius: 9,
    padding: 9,
  },
  filterRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    backgroundColor: T.surf2,
    borderWidth: 1,
    borderColor: T.bdr,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  chipActive: {
    backgroundColor: T.brand,
    borderColor: T.brandL,
  },
  chipSort: {
    backgroundColor: T.surf3,
    borderColor: T.bdr,
  },
  chipText: { fontSize: 11, color: T.txS, fontWeight: '500' },
  chipTextActive: { color: T.tx },
  sortSep: { width: 1, height: 18, backgroundColor: T.bdr, marginHorizontal: 4 },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.highBg,
    borderWidth: 1,
    borderColor: T.highBdr,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 7,
  },
  warningText: { fontSize: 12, color: T.highTx, fontWeight: '500' },
  groupBlock: { marginBottom: 16 },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  groupLabel: { fontSize: 11, fontWeight: '700', color: T.txM, letterSpacing: 0.5 },
  groupTotal: { fontSize: 11, color: T.txS },
  assetCard: { marginBottom: 6 },
  assetRow: {
    flexDirection: 'row',
    padding: 14,
    gap: 10,
  },
  assetLeft: { flex: 1 },
  assetBadgeRow: { flexDirection: 'row', gap: 6, marginBottom: 6, flexWrap: 'wrap' },
  nomineeWarn: {
    backgroundColor: 'rgba(190,68,68,0.18)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  nomineeWarnText: { fontSize: 9, fontWeight: '700', color: T.redL, letterSpacing: 0.5 },
  assetDesc: { fontSize: 14, fontWeight: '700', color: T.tx, marginBottom: 2 },
  assetInst: { fontSize: 12, color: T.txS, marginBottom: 2 },
  maturityRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  maturityText: { fontSize: 11, color: T.txM },
  assetRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  assetValue: { fontSize: 16, fontWeight: '700', color: T.tx },
  assetAge: { fontSize: 11, color: T.txM, marginTop: 2 },
  assetAgeStale: { color: T.amberL },
  assetActions: { flexDirection: 'row', gap: 4, marginTop: 4 },
  actionBtn: { padding: 4 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: T.brand,
    borderRadius: 18,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: T.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
});
