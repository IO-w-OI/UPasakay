import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';

export default function TabLayout() {
  return (
    <NativeTabs
      tintColor="#0b7a3f"          // active icon + label color (green)
   // optional background
    >
      <NativeTabs.Trigger name="UserHome">
        <Icon sf="house.fill" drawable="ic_menu_home" />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="UserRecents">
        <Icon sf="clock.fill" drawable="ic_menu_recent_history" />
        <Label>Recents</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="UserMap">
        <Icon sf="map.fill" drawable="ic_menu_mapmode" />
        <Label>Map</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="UserProfile">
        <Icon sf="person.crop.circle.fill" drawable="ic_menu_edit" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}