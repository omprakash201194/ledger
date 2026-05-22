import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useAlertStore } from '@/store/alertStore';
import { T } from '@/theme';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  route?: string;
  color: string;
  action?: () => void;
  badge?: number;
}

export default function MoreScreen() {
  const router = useRouter();
  const { name, email, logout } = useAuthStore();
  const unreadAlerts = useAlertStore((s) => s.unreadCount);

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'repeat-outline',
      label: 'Recurring Obligations',
      subtitle: 'EMIs, SIPs, subscriptions',
      route: '/recurring',
      color: T.amber,
    },
    {
      icon: 'people-outline',
      label: 'Trusted Persons',
      subtitle: 'Family, advisors, executors',
      route: '/trusted-persons',
      color: T.green,
    },
    {
      icon: 'laptop-outline',
      label: 'Digital Accounts',
      subtitle: 'Passwords, online services',
      route: '/digital-accounts',
      color: T.brand,
    },
    {
      icon: 'document-text-outline',
      label: 'Will & Estate',
      subtitle: 'Your Will record',
      route: '/will',
      color: T.gold,
    },
    {
      icon: 'trending-down-outline',
      label: 'Liabilities',
      subtitle: 'Loans, credit cards',
      route: '/liabilities',
      color: T.red,
    },
    {
      icon: 'notifications-outline',
      label: 'Alerts',
      subtitle: 'Reminders & notices',
      route: '/(app)/alerts',
      color: T.redL,
      badge: unreadAlerts > 0 ? unreadAlerts : undefined,
    },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>More</Text>
        </View>

        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(name ?? '?')[0]?.toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{name || 'User'}</Text>
            <Text style={styles.userEmail}>{email}</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuBlock}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.action ? item.action : () => router.push(item.route as any)}
              style={[
                styles.menuRow,
                idx < menuItems.length - 1 && styles.menuRowBorder,
              ]}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '22' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.subtitle}</Text>
              </View>
              {item.badge != null && item.badge > 0 && (
                <View style={styles.itemBadge}>
                  <Text style={styles.itemBadgeText}>{item.badge}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={16} color={T.txM} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity onPress={handleLogout} style={styles.signOutRow}>
          <Ionicons name="log-out-outline" size={18} color={T.redL} />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Ledger — Family Financial Legacy Register</Text>
      </ScrollView>
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: T.tx },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    margin: 16,
    backgroundColor: T.surf2,
    borderWidth: 1,
    borderColor: T.bdr,
    borderRadius: 12,
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: T.brand + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: T.brandL, fontSize: 20, fontWeight: '700' },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '600', color: T.tx },
  userEmail: { fontSize: 12, color: T.txS, marginTop: 2 },
  menuBlock: {
    backgroundColor: T.surf2,
    borderWidth: 1,
    borderColor: T.bdr,
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: T.bdrF,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: T.tx },
  menuSub: { fontSize: 11, color: T.txM, marginTop: 1 },
  itemBadge: {
    backgroundColor: T.red,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginRight: 4,
  },
  itemBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 13,
    paddingHorizontal: 14,
    backgroundColor: T.highBg,
    borderWidth: 1,
    borderColor: T.highBdr,
    borderRadius: 12,
    justifyContent: 'center',
  },
  signOutText: { fontSize: 14, fontWeight: '600', color: T.redL },
  version: { textAlign: 'center', fontSize: 11, color: T.txM, marginTop: 20 },
});
