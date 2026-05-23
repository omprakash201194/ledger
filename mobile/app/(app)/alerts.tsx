import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert as AlertType, alertsApi } from '@/api/alerts';
import { useAlertStore } from '@/store/alertStore';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { Toast, useToast } from '@/components/Toast';
import { timeAgo } from '@/utils/timeAgo';
import { useAppTheme } from '@/contexts/ThemeContext';

type Urgency = 'high' | 'medium' | 'low';

const URGENCY_MAP: Record<string, Urgency> = {
  NOMINEE_MISSING: 'high',
  INSURANCE_PREMIUM_DUE: 'high',
  FD_MATURITY_DUE: 'medium',
  EMI_DUE: 'high',
  EMI_ENDING_SOON: 'medium',
  WILL_REVIEW_DUE: 'medium',
  ASSET_VALUE_STALE: 'low',
  WILL_NO_REVIEW: 'medium',
  OBLIGATION_REVIEW: 'low',
};

const ALERT_ICONS: Record<string, string> = {
  NOMINEE_MISSING: '👤',
  INSURANCE_PREMIUM_DUE: '🛡',
  FD_MATURITY_DUE: '⏱',
  EMI_DUE: '💳',
  EMI_ENDING_SOON: '📅',
  WILL_REVIEW_DUE: '📄',
  ASSET_VALUE_STALE: '📊',
  WILL_NO_REVIEW: '📄',
  OBLIGATION_REVIEW: '🔄',
};

interface Section {
  urgency: Urgency | 'read';
  alerts: AlertType[];
}

export default function AlertsScreen() {
  const { setUnreadCount, decrementUnreadCount } = useAlertStore();
  const { toast, show: showToast, hide: hideToast } = useToast();
  const { theme } = useAppTheme();

  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Build urgency config from current theme
  const URGENCY_CONFIG = useMemo(() => ({
    high: { label: 'HIGH', bg: theme.highBg, bdr: theme.highBdr, tx: theme.highTx, dot: theme.red, sectionLabel: 'Needs immediate attention' },
    medium: { label: 'MEDIUM', bg: theme.medBg, bdr: theme.medBdr, tx: theme.medTx, dot: theme.amber, sectionLabel: 'Review soon' },
    low: { label: 'LOW', bg: theme.lowBg, bdr: theme.lowBdr, tx: theme.lowTx, dot: theme.brand, sectionLabel: 'For your awareness' },
  }), [theme]);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await alertsApi.getAll();
      const sorted = [...data].sort((a, b) => {
        if (a.isRead === b.isRead) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.isRead ? 1 : -1;
      });
      setAlerts(sorted);
      setUnreadCount(sorted.filter((a) => !a.isRead).length);
    } catch {
      showToast('Failed to load alerts', 'error');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchAlerts().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  }, []);

  const handleMarkRead = async (alert: AlertType) => {
    if (alert.isRead) return;
    try {
      await alertsApi.markRead(alert.id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alert.id ? { ...a, isRead: true } : a))
      );
      decrementUnreadCount();
    } catch {
      showToast('Failed to mark as read', 'error');
    }
  };

  const unread = alerts.filter((a) => !a.isRead);
  const sections: Section[] = (['high', 'medium', 'low'] as Urgency[])
    .map((urgency) => ({
      urgency,
      alerts: unread.filter((a) => (URGENCY_MAP[a.alertType] ?? 'low') === urgency),
    }))
    .filter((s) => s.alerts.length > 0);

  const readAlerts = alerts.filter((a) => a.isRead);
  const unreadCount = unread.length;

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
    unreadBadge: {
      backgroundColor: theme.highBg,
      borderWidth: 1,
      borderColor: theme.highBdr,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    unreadBadgeText: { color: theme.highTx, fontSize: 12, fontWeight: '600' },
    sectionBlock: { marginTop: 16 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 },
    dot: { width: 7, height: 7, borderRadius: 4 },
    sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
    sectionDimLabel: { fontSize: 11, fontWeight: '700', color: theme.txM, letterSpacing: 0.6, marginBottom: 8 },
    alertCard: {
      flexDirection: 'row',
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
      marginBottom: 6,
      gap: 10,
      alignItems: 'flex-start',
    },
    iconSquare: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    iconEmoji: { fontSize: 18 },
    alertBody: { flex: 1 },
    alertTitle: { fontSize: 13, fontWeight: '700', marginBottom: 3 },
    alertMsg: { fontSize: 12, lineHeight: 17 },
    alertTime: { fontSize: 11, color: theme.txM, marginTop: 4 },
  }), [theme]);

  const renderAlertCard = (alert: AlertType) => {
    const urgency = URGENCY_MAP[alert.alertType] ?? 'low';
    const cfg = URGENCY_CONFIG[urgency as Urgency];
    const icon = ALERT_ICONS[alert.alertType] ?? '⚠️';

    return (
      <TouchableOpacity
        key={alert.id}
        onPress={() => handleMarkRead(alert)}
        style={[
          styles.alertCard,
          {
            backgroundColor: alert.isRead ? theme.surf2 : cfg.bg,
            borderColor: alert.isRead ? theme.bdr : cfg.bdr,
          },
        ]}
      >
        <View style={[styles.iconSquare, { backgroundColor: alert.isRead ? theme.surf3 : cfg.bg }]}>
          <Text style={styles.iconEmoji}>{icon}</Text>
        </View>
        <View style={styles.alertBody}>
          <Text style={[styles.alertTitle, { color: alert.isRead ? theme.txS : theme.tx }]}>
            {alert.title}
          </Text>
          <Text style={[styles.alertMsg, { color: alert.isRead ? theme.txM : theme.txS }]}>
            {alert.message}
          </Text>
          <Text style={styles.alertTime}>
            {timeAgo(alert.createdAt)}
            {!alert.isRead && <Text style={{ color: theme.brandL }}> · Tap to dismiss</Text>}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alerts</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
          </View>
        )}
      </View>

      {loading ? (
        <LoadingState message="Loading alerts..." />
      ) : alerts.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title="All clear!"
          subtitle="No alerts at the moment. Check back later."
        />
      ) : (
        <FlatList
          data={[...sections, readAlerts.length > 0 ? { urgency: 'read' as const, alerts: readAlerts } : null].filter(Boolean)}
          keyExtractor={(_, i) => String(i)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.brandL} />
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item: section }) => {
            if (!section) return null;
            if (section.urgency === 'read') {
              return (
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionDimLabel}>DISMISSED</Text>
                  {section.alerts.map(renderAlertCard)}
                </View>
              );
            }
            const cfg = URGENCY_CONFIG[section.urgency as Urgency];
            return (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.dot, { backgroundColor: cfg.dot }]} />
                  <Text style={[styles.sectionLabel, { color: cfg.tx }]}>
                    {cfg.sectionLabel.toUpperCase()}
                  </Text>
                </View>
                {section.alerts.map(renderAlertCard)}
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
