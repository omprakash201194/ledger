import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CC } from '@/theme';

interface TypeBadgeProps {
  code: string;
  label: string;
  size?: 'sm' | 'lg';
}

export function TypeBadge({ code, label, size = 'sm' }: TypeBadgeProps) {
  const colors = CC[code] ?? { bg: 'rgba(100,100,100,0.18)', tx: '#888' };
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, size === 'lg' && styles.badgeLg]}>
      <Text style={[styles.text, { color: colors.tx }, size === 'lg' && styles.textLg]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  badgeLg: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  text: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textLg: {
    fontSize: 11,
  },
});
