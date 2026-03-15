import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#701929', 
          borderTopWidth: 0,
          elevation: 0, // Removes shadow on Android
        },
      }}>
      
      {/* Hides the "index" button from the bottom bar */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, 
          tabBarStyle: { display: 'none' }, // Hides bar on Login screen
        }}
      />
    </Tabs>
  );
}
