import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform, StyleSheet } from 'react-native';

// --- IOS NATIVE LAYOUT (True Liquid Glass) ---
function NativeTabsLayout() {
  return (
    <NativeTabs
      tintColor="#0b7a3f"          // active icon + label color (green)
   // optional background
    >
      <NativeTabs.Trigger name="DriverHome">
        <Icon sf="house.fill" drawable="ic_menu_home" />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="DriverRecents">
        <Icon sf="bell.fill" drawable="ic_popup_reminder" />
        <Label>Notifications</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="DriverProfile">
        <Icon sf="person.crop.circle.fill" drawable="ic_menu_edit" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

// --- ANDROID CUSTOM LAYOUT (Simulated Glass) ---
function CustomJSLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0b7a3f',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: styles.androidTabContainer,
      }}
    >
      <Tabs.Screen
        name="DriverHome"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="DriverRecents"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <Ionicons name="notifications" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="DriverProfile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

// --- ROOT EXPORT ---
export default function TabLayout() {
  return Platform.OS === 'ios' ? <NativeTabsLayout /> : <CustomJSLayout />;
}

const styles = StyleSheet.create({
  androidTabContainer: {
    // Positioning
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    
    // Shape & Visuals
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffffff', // Clean white background to avoid the purple "pill"
    borderTopWidth: 0,
    
    // Shadow (Elevation)
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    
    // Centering labels/icons
    paddingBottom: 12,
    paddingTop: 8,
  },
});