import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useAppTheme } from "@/contexts/ThemeContext";

interface SectionIntroProps {
  /** Unique key used to persist the dismissed state (e.g. "home", "assets"). */
  sectionKey: string;
  note: string;
}

/** Dismissible info banner shown at the top of every section screen.
 *  Dismissed state is persisted per-section via SecureStore. */
export function SectionIntro({ sectionKey, note }: SectionIntroProps) {
  const { isDark } = useAppTheme();
  const [dismissed, setDismissed] = useState<boolean | null>(null); // null = loading

  useEffect(() => {
    SecureStore.getItemAsync(`sectionIntro:${sectionKey}`).then((val) => {
      setDismissed(val === 'dismissed');
    });
  }, [sectionKey]);

  const handleDismiss = async () => {
    setDismissed(true);
    await SecureStore.setItemAsync(`sectionIntro:${sectionKey}`, 'dismissed');
  };

  // Don't render while loading or if dismissed
  if (dismissed !== false) return null;

  return (
    <View style={[
      styles.container,
      isDark ? styles.containerDark : styles.containerLight,
    ]}>
      <Ionicons
        name="information-circle-outline"
        size={16}
        color={isDark ? '#818cf8' : '#6366f1'}
        style={{ marginTop: 1 }}
      />
      <Text style={[styles.text, isDark ? styles.textDark : styles.textLight]}>
        {note}
      </Text>
      <TouchableOpacity onPress={handleDismiss} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <Ionicons
          name="close-outline"
          size={18}
          color={isDark ? '#818cf8' : '#6366f1'}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  containerDark: {
    backgroundColor: 'rgba(99,102,241,0.10)',
    borderColor: 'rgba(99,102,241,0.20)',
  },
  containerLight: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  textDark: {
    color: '#a5b4fc',
  },
  textLight: {
    color: '#4338ca',
  },
});
