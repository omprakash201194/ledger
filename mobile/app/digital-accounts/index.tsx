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
  DigitalAccount,
  digitalAccountsApi,
  DIGITAL_ACCOUNT_CATEGORY_LABELS,
} from '@/api/digitalAccounts';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { Toast, useToast } from '@/components/Toast';
import { TypeBadge } from '@/components/TypeBadge';
import { CardWrap } from '@/components/CardWrap';
import { SectionIntro } from '@/components/SectionIntro';
import { timeAgo } from '@/utils/timeAgo';
import { T, CC } from '@/theme';

export default function DigitalAccountsScreen() {
  const router = useRouter();
  const { toast, show: showToast, hide: hideToast } = useToast();

  const [accounts, setAccounts] = useState<DigitalAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const data = await digitalAccountsApi.getAll();
      setAccounts(data);
    } catch {
      showToast('Failed to load accounts', 'error');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchAccounts().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAccounts();
    setRefreshing(false);
  }, []);

  const handleDelete = (account: DigitalAccount) => {
    Alert.alert(
      'Delete account',
      `Delete "${account.serviceName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await digitalAccountsApi.delete(account.id);
              setAccounts((prev) => prev.filter((a) => a.id !== account.id));
              showToast('Account deleted', 'success');
            } catch {
              showToast('Failed to delete', 'error');
            }
          },
        },
      ]
    );
  };

  const InfoBanner = () => (
    <View style={styles.infoBanner}>
      <Ionicons name="information-circle-outline" size={16} color={T.brandL} />
      <Text style={styles.infoText}>
        Important: do not type passwords here. Note where the password is kept
        (e.g. 'in Bitwarden vault' or 'sealed envelope with spouse').
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />

      {loading ? (
        <LoadingState message="Loading accounts..." />
      ) : accounts.length === 0 ? (
        <>
          <InfoBanner />
          <SectionIntro note="Email, banking apps, investment platforms, government portals, social media and cloud storage. Document your online accounts." />
          <EmptyState
            icon="laptop-outline"
            title="No digital accounts"
            subtitle="Document your online accounts and what should happen to them when you're gone."
            ctaLabel="Add account"
            onCta={() => router.push('/digital-accounts/form')}
          />
        </>
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <InfoBanner />
              <SectionIntro note="Email, banking apps, investment platforms, government portals, social media and cloud storage. Important: do not type passwords directly here." />
            </>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.brand} />
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          renderItem={({ item: account }) => {
            const colors = CC[account.category] ?? CC.BANKING;
            return (
              <CardWrap
                onPress={() => router.push(`/digital-accounts/form?id=${account.id}`)}
                style={styles.card}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardRow}>
                    {/* Icon square */}
                    <View style={[styles.iconSquare, { backgroundColor: colors.bg }]}>
                      <Ionicons name="key-outline" size={18} color={colors.tx} />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.serviceName}>{account.serviceName}</Text>
                      <View style={styles.badgeRow}>
                        <TypeBadge code={account.category} label={DIGITAL_ACCOUNT_CATEGORY_LABELS[account.category]} />
                        {account.username && (
                          <Text style={styles.username}>{account.username}</Text>
                        )}
                      </View>
                      {account.credentialLocation && (
                        <Text style={styles.credLoc}>Credentials: {account.credentialLocation}</Text>
                      )}
                    </View>
                    <View style={styles.rightCol}>
                      <Ionicons name="chevron-forward" size={16} color={T.txM} />
                      <View style={styles.rowActions}>
                        <TouchableOpacity
                          onPress={() => router.push(`/digital-accounts/form?id=${account.id}`)}
                          style={styles.actionBtn}
                        >
                          <Ionicons name="pencil-outline" size={13} color={T.txM} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(account)} style={styles.actionBtn}>
                          <Ionicons name="trash-outline" size={13} color={T.redL} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </CardWrap>
            );
          }}
        />
      )}

      <TouchableOpacity
        onPress={() => router.push('/digital-accounts/form')}
        style={styles.fab}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: T.lowBg,
    borderWidth: 1,
    borderColor: T.lowBdr,
    borderRadius: 10,
    margin: 16,
    marginBottom: 0,
    padding: 12,
  },
  infoText: { flex: 1, fontSize: 12, color: T.txS, lineHeight: 17 },
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
  cardInfo: { flex: 1 },
  serviceName: { fontSize: 14, fontWeight: '600', color: T.tx, marginBottom: 5 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  username: { fontSize: 11, color: T.txM },
  credLoc: { fontSize: 11, color: T.txM, marginTop: 3 },
  rightCol: { alignItems: 'center', justifyContent: 'space-between', height: 44 },
  rowActions: { flexDirection: 'row', gap: 2 },
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
