import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { dashboardApi, DashboardSummary } from '@/api/dashboard';
import { assetsApi } from '@/api/assets';
import { liabilitiesApi } from '@/api/liabilities';
import { insuranceApi } from '@/api/insurance';
import { recurringApi } from '@/api/recurring';
import { useAuthStore } from '@/store/authStore';
import { useAlertStore } from '@/store/alertStore';
import { SectionIntro } from '@/components/SectionIntro';
import { T, fmtINR } from '@/theme';

interface SectionCount {
  assets: number;
  liabilities: number;
  insurance: number;
  recurring: number;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen() {
  const router = useRouter();
  const { name } = useAuthStore();
  const setUnreadCount = useAlertStore((s) => s.setUnreadCount);
  const unreadAlerts = useAlertStore((s) => s.unreadCount);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [counts, setCounts] = useState<SectionCount>({
    assets: 0,
    liabilities: 0,
    insurance: 0,
    recurring: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animated count-up for net worth
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayedNetWorth, setDisplayedNetWorth] = useState(0);

  const animateNetWorth = (target: number) => {
    const startTime = Date.now();
    const duration = 1000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedNetWorth(Math.round(target * eased));
      if (progress >= 1) clearInterval(interval);
    }, 16);
  };

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [dash, assets, liabilities, insurance, recurring] =
        await Promise.all([
          dashboardApi.getNetWorth(),
          assetsApi.getAll(),
          liabilitiesApi.getAll(),
          insuranceApi.getAll(),
          recurringApi.getAll(),
        ]);
      setSummary(dash);
      setUnreadCount(dash.unreadAlertCount);
      setCounts({
        assets: assets.length,
        liabilities: liabilities.length,
        insurance: insurance.length,
        recurring: recurring.length,
      });
      animateNetWorth(dash.netWorth ?? 0);
    } catch {
      setError('Unable to load dashboard. Check your connection.');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const netWorth = summary?.netWorth ?? 0;
  const totalAssets = summary?.totalAssets ?? 0;
  const totalLiabilities = summary?.totalLiabilities ?? 0;

  const checklist = [
    { label: 'Add your first asset', done: counts.assets > 0, route: '/(app)/assets' },
    { label: 'Add an insurance policy', done: counts.insurance > 0, route: '/(app)/insurance' },
    { label: 'Set up your Will', done: false, route: '/will' },
    { label: 'Add trusted persons', done: false, route: '/trusted-persons' },
    { label: 'Add liabilities', done: counts.liabilities > 0, route: '/liabilities' },
    { label: 'Add digital accounts', done: false, route: '/digital-accounts' },
    { label: 'Add recurring obligations', done: counts.recurring > 0, route: '/recurring' },
  ];

  const doneCount = checklist.filter((c) => c.done).length;
  const allDone = doneCount === checklist.length;

  const modules = [
    { label: 'Assets', value: fmtINR(totalAssets), sub: `${counts.assets} items`, icon: 'wallet-outline' as const, color: T.greenL, route: '/(app)/assets' },
    { label: 'Insurance', value: `${counts.insurance}`, sub: 'policies', icon: 'shield-checkmark-outline' as const, color: T.brandL, route: '/(app)/insurance' },
    { label: 'Liabilities', value: fmtINR(totalLiabilities), sub: `${counts.liabilities} items`, icon: 'trending-down-outline' as const, color: T.redL, route: '/liabilities' },
    { label: 'Recurring', value: `${counts.recurring}`, sub: 'obligations', icon: 'repeat-outline' as const, color: T.amberL, route: '/recurring' },
    { label: 'Trusted', value: '—', sub: 'persons', icon: 'people-outline' as const, color: T.gold, route: '/trusted-persons' },
    { label: 'Will', value: summary ? (summary.netWorth != null ? '✓' : '—') : '—', sub: 'estate planning', icon: 'document-text-outline' as const, color: T.gold, route: '/will' },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={T.brandL}
          />
        }
      >
        {/* Topbar */}
        <View style={styles.topbar}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{name || 'Family Member'}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(app)/alerts')}
            style={styles.bellBtn}
          >
            <Ionicons name="notifications-outline" size={22} color={T.txS} />
            {unreadAlerts > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>
                  {unreadAlerts > 9 ? '9+' : unreadAlerts}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>Loading your financial summary...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Ionicons name="cloud-offline-outline" size={40} color={T.txM} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={() => { setLoading(true); fetchData().finally(() => setLoading(false)); }}
              style={styles.retryBtn}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Net Worth Hero */}
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>NET WORTH</Text>
              <Text style={[styles.heroValue, { color: netWorth < 0 ? T.redL : T.gold }]}>
                {fmtINR(displayedNetWorth)}
              </Text>
              <View style={styles.heroRow}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>ASSETS</Text>
                  <Text style={[styles.heroStatValue, { color: T.greenL }]}>{fmtINR(totalAssets)}</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>LIABILITIES</Text>
                  <Text style={[styles.heroStatValue, { color: T.redL }]}>{fmtINR(totalLiabilities)}</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>ITEMS</Text>
                  <Text style={[styles.heroStatValue, { color: T.txS }]}>
                    {counts.assets + counts.liabilities + counts.insurance + counts.recurring}
                  </Text>
                </View>
              </View>
            </View>

            {/* Alert banner */}
            {unreadAlerts > 0 && (
              <TouchableOpacity
                onPress={() => router.push('/(app)/alerts')}
                style={styles.alertBanner}
              >
                <Ionicons name="warning-outline" size={18} color={T.highTx} />
                <Text style={styles.alertBannerText}>
                  {unreadAlerts} item{unreadAlerts !== 1 ? 's' : ''} need attention
                </Text>
                <Ionicons name="chevron-forward" size={15} color={T.highTx} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            )}

            {/* Modules grid */}
            <View style={styles.grid}>
              {modules.map((mod) => (
                <TouchableOpacity
                  key={mod.label}
                  onPress={() => router.push(mod.route as any)}
                  style={styles.moduleCard}
                >
                  <View style={[styles.moduleIcon, { backgroundColor: mod.color + '1A' }]}>
                    <Ionicons name={mod.icon} size={20} color={mod.color} />
                  </View>
                  <Text style={styles.moduleValue}>{mod.value}</Text>
                  <Text style={styles.moduleLabel}>{mod.label}</Text>
                  <Text style={styles.moduleSub}>{mod.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Setup progress */}
            {!allDone && (
              <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Setup progress</Text>
                  <Text style={styles.progressCount}>{doneCount} / {checklist.length}</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${(doneCount / checklist.length) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressHint}>
                  Complete all sections so your family has everything they need.
                </Text>
              </View>
            )}

            <SectionIntro note="Your financial life at a glance. The numbers here are a summary of what you've recorded across each section. Update each section periodically — the more current it is, the more useful it becomes for you today and for your family if you cannot act yourself." />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.bg,
  },
  scroll: {
    flex: 1,
  },
  topbar: {
    backgroundColor: T.surf,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 12,
    color: T.txM,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: T.tx,
    marginTop: 2,
  },
  bellBtn: {
    backgroundColor: T.surf3,
    borderWidth: 1,
    borderColor: T.bdr,
    borderRadius: 10,
    padding: 10,
  },
  bellBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: T.red,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  loadingBox: {
    margin: 16,
    backgroundColor: T.surf2,
    borderRadius: 14,
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: T.txS,
    fontSize: 13,
  },
  errorBox: {
    margin: 16,
    backgroundColor: T.surf2,
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
  },
  errorText: {
    color: T.txS,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
  retryBtn: {
    marginTop: 14,
    backgroundColor: T.brand,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 9,
  },
  retryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  heroCard: {
    margin: 12,
    marginHorizontal: 16,
    backgroundColor: '#182338',
    borderWidth: 1,
    borderColor: T.bdr,
    borderRadius: 14,
    padding: 20,
  },
  heroLabel: {
    fontSize: 11,
    color: T.txM,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  heroValue: {
    fontSize: 38,
    fontWeight: '700',
    color: T.gold,
    marginBottom: 16,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatLabel: {
    fontSize: 9,
    color: T.txM,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  heroStatValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroDivider: {
    width: 1,
    height: 28,
    backgroundColor: T.bdrF,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.highBg,
    borderWidth: 1,
    borderColor: T.highBdr,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  alertBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: T.highTx,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 12,
    gap: 8,
  },
  moduleCard: {
    width: '47%',
    backgroundColor: T.surf2,
    borderWidth: 1,
    borderColor: T.bdr,
    borderRadius: 12,
    padding: 14,
  },
  moduleIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  moduleValue: {
    fontSize: 14,
    fontWeight: '700',
    color: T.tx,
    marginBottom: 2,
  },
  moduleLabel: {
    fontSize: 11,
    color: T.txM,
  },
  moduleSub: {
    fontSize: 10,
    color: T.txM,
    marginTop: 1,
  },
  progressCard: {
    backgroundColor: T.surf2,
    borderWidth: 1,
    borderColor: T.bdr,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: T.tx,
  },
  progressCount: {
    fontSize: 13,
    fontWeight: '700',
    color: T.gold,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: T.bdrF,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBarFill: {
    height: 5,
    backgroundColor: T.gold,
    borderRadius: 3,
  },
  progressHint: {
    fontSize: 11,
    color: T.txM,
  },
});
