import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { darkTheme, lightTheme, AppTheme } from '@/theme';

const THEME_KEY = 'ledger_theme';

interface ThemeContextValue {
  theme: AppTheme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: darkTheme,
  isDark: true,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true); // default dark until loaded

  // Load persisted preference on mount
  useEffect(() => {
    SecureStore.getItemAsync(THEME_KEY).then((val) => {
      if (val === 'light') {
        setIsDark(false);
        Appearance.setColorScheme('light');
      } else {
        setIsDark(true);
        Appearance.setColorScheme('dark');
      }
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      Appearance.setColorScheme(next ? 'dark' : 'light');
      SecureStore.setItemAsync(THEME_KEY, next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
