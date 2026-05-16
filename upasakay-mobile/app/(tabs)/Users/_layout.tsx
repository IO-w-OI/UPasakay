import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform, StyleSheet } from 'react-native';
import React, { useEffect } from 'react'; // Added React and useEffect
import * as Notifications from 'expo-notifications'; // Added Notifications

// --- IOS NATIVE LAYOUT (True Liquid Glass) ---
function NativeTabsLayout() {
  return (
    <NativeTabs
      tintColor="#0b7a3f" // active icon + label color (green)
    >
      <NativeTabs.Trigger name="UserHome">
        <Icon sf="house.fill" drawable="ic_menu_home" />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="UserRecents">
        <Icon sf="clock.fill" drawable="ic_menu_recent_history" />
        <Label>Recents</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="UserProfile">
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
        name="UserHome"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="UserRecents"
        options={{
          title: 'Recents',
          tabBarIcon: ({ color }) => <Ionicons name="time" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="UserProfile"
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
  
  // STEP 1: Ask for permissions when the Tabs layout mounts
  useEffect(() => {
    async function requestPermissions() {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
    }

    requestPermissions();
  }, []);

  return Platform.OS === 'ios' ? <NativeTabsLayout /> : <CustomJSLayout />;
}

const styles = StyleSheet.create({
  androidTabContainer: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffffff',
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    paddingBottom: 12,
    paddingTop: 8,
  },
});