import React, { useMemo } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/contexts/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useAppTheme();

  const styles = useMemo(() => StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.bg },
    header: {
      backgroundColor: theme.surf,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.bdrF,
    },
    backBtn: {
      padding: 4,
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: theme.tx },
    section: {
      marginTop: 24,
      marginHorizontal: 16,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.txM,
      letterSpacing: 0.8,
      marginBottom: 10,
      paddingHorizontal: 4,
    },
    card: {
      backgroundColor: theme.surf2,
      borderWidth: 1,
      borderColor: theme.bdr,
      borderRadius: 12,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 14,
    },
    rowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.bdrF,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowText: { flex: 1 },
    rowLabel: { fontSize: 14, fontWeight: '600', color: theme.tx },
    rowSub: { fontSize: 12, color: theme.txM, marginTop: 1 },
    version: {
      textAlign: 'center',
      fontSize: 11,
      color: theme.txM,
      marginTop: 32,
    },
  }), [theme]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.tx} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Appearance */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>APPEARANCE</Text>
        <View style={styles.card}>
          <View style={[styles.row]}>
            <View style={[styles.iconBox, { backgroundColor: theme.brand + '22' }]}>
              <Ionicons
                name={isDark ? 'moon-outline' : 'sunny-outline'}
                size={20}
                color={theme.brandL}
              />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Dark mode</Text>
              <Text style={styles.rowSub}>
                {isDark ? 'Currently using dark theme' : 'Currently using light theme'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.bdr, true: theme.brand }}
              thumbColor={isDark ? theme.brandL : theme.txM}
            />
          </View>
        </View>
      </View>

      <Text style={styles.version}>Ledger v1.5.0 — Family Financial Legacy Register</Text>
    </SafeAreaView>
  );
}
