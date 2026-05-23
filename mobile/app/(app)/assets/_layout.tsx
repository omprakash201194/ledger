import { Stack } from 'expo-router';
import { T } from '@/theme';

export default function AssetsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: T.bg },
      }}
    />
  );
}
