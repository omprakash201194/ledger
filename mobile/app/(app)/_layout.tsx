import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlertStore } from '@/store/alertStore';
import { useAppTheme } from '@/contexts/ThemeContext';

function AlertBadge({ theme }: { theme: ReturnType<typeof useAppTheme>['theme'] }) {
  const unreadCount = useAlertStore((s) => s.unreadCount);
  if (unreadCount === 0) return null;
  return (
    <View style={[styles.badge, { backgroundColor: theme.red }]}>
      <Text style={styles.badgeText}>
        {unreadCount > 99 ? '99+' : unreadCount}
      </Text>
    </View>
  );
}

function MoreIcon({ color, size, theme }: { color: string; size: number; theme: ReturnType<typeof useAppTheme>['theme'] }) {
  return (
    <View>
      <Ionicons name="grid-outline" size={size} color={color} />
      <AlertBadge theme={theme} />
    </View>
  );
}

export default function AppLayout() {
  const { theme } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.brandL,
        tabBarInactiveTintColor: theme.txM,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: theme.bdrF,
          backgroundColor: theme.surf,
          paddingBottom: 20,
          height: 72,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="assets"
        options={{
          title: 'Assets',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insurance"
        options={{
          title: 'Insurance',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => (
            <MoreIcon color={color} size={size} theme={theme} />
          ),
        }}
      />
      {/* Settings is a stack screen within (app), not a tab */}
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // hide from tab bar
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
});
