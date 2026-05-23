import React, { useMemo } from 'react';
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
import { useAppTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useAppTheme();

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
      icon: 'settings-outline',
      label: 'Settings',
      subtitle: 'Appearance, preferences',
      route: '/(app)/settings',
      color: theme.txS,
    },
    {
      icon: 'repeat-outline',
      label: 'Recurring Obligations',
      subtitle: 'EMIs, SIPs, subscriptions',
      route: '/recurring',
      color: theme.amber,
    },
    {
      icon: 'people-outline',
      label: 'Trusted Persons',
      subtitle: 'Family, advisors, executors',
      route: '/trusted-persons',
      color: theme.green,
    },
    {
      icon: 'laptop-outline',
      label: 'Digital Accounts',
      subtitle: 'Passwords, online services',
      route: '/digital-accounts',
      color: theme.brand,
    },
    {
      icon: 'document-text-outline',
      label: 'Will & Estate',
      subtitle: 'Your Will record',
      route: '/will',
      color: theme.gold,
    },
    {
      icon: 'trending-down-outline',
      label: 'Liabilities',
      subtitle: 'Loans, credit cards',
      route: '/liabilities',
      color: theme.red,
    },
  ];

  const styles = useMemo(() => StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.bg },
    header: {
      backgroundColor: theme.surf,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.bdrF,
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: theme.tx },
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      margin: 16,
      backgroundColor: theme.surf2,
      borderWidth: 1,
      borderColor: theme.bdr,
      borderRadius: 12,
      padding: 16,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.brand + '33',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { color: theme.brandL, fontSize: 20, fontWeight: '700' },
    userInfo: { flex: 1 },
    userName: { fontSize: 15, fontWeight: '600', color: theme.tx },
    userEmail: { fontSize: 12, color: theme.txS, marginTop: 2 },
    menuBlock: {
      backgroundColor: theme.surf2,
      borderWidth: 1,
      borderColor: theme.bdr,
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
    menuRowBorder: { borderBottomWidth: 1, borderBottomColor: theme.bdrF },
    menuIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    menuText: { flex: 1 },
    menuLabel: { fontSize: 14, fontWeight: '600', color: theme.tx },
    menuSub: { fontSize: 11, color: theme.txM, marginTop: 1 },
    itemBadge: {
      backgroundColor: theme.red,
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
      backgroundColor: theme.highBg,
      borderWidth: 1,
      borderColor: theme.highBdr,
      borderRadius: 12,
      justifyContent: 'center',
    },
    signOutText: { fontSize: 14, fontWeight: '600', color: theme.redL },
    version: { textAlign: 'center', fontSize: 11, color: theme.txM, marginTop: 20 },
  }), [theme]);

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
              <Ionicons name="chevron-forward" size={16} color={theme.txM} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity onPress={handleLogout} style={styles.signOutRow}>
          <Ionicons name="log-out-outline" size={18} color={theme.redL} />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Ledger — Family Financial Legacy Register</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
