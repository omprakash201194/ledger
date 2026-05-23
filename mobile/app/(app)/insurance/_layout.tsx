import { Stack } from 'expo-router';
import { T } from '@/theme';

export default function InsuranceLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: T.bg },
      }}
    />
  );
}
