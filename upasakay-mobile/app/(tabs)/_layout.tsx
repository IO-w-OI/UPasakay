import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="Drivers" />
      <Tabs.Screen name="Users" />
    </Tabs>
  );
}