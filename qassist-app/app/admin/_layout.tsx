import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="staff-management" />
      <Stack.Screen name="departments" />
      <Stack.Screen name="reports" />
    </Stack>
  );
}

