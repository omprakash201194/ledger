import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/contexts/ThemeContext";

interface SectionIntroProps {
  /** Unique key (unused now — kept for API compatibility). */
  sectionKey: string;
  note: string;
}

/** Dismissible info banner shown at the top of every section screen.
 *  Dismissed for the current session only — reappears on next app open. */
export function SectionIntro({ note }: SectionIntroProps) {
  const { isDark } = useAppTheme();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

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
      <TouchableOpacity onPress={() => setDismissed(true)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
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
    backgroundColor: 'rgba(99,102,241,0.08)',
    borderColor: 'rgba(99,102,241,0.25)',
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
