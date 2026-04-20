import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <Stack>
      <Stack.Screen name="Drivers" />
      <Stack.Screen name="Users" />
    </Stack>
  );
}