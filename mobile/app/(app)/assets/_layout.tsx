import { Stack } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';

export default function AssetsLayout() {
  const { theme } = useAppTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg },
      }}
    />
  );
}
