import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="UserHome">
        <Icon sf={"house.fill"} drawable="ic_menu_mylocation" />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="UserRecents">
        <Icon sf={"house.fill"} drawable="ic_menu_mylocation" />
        <Label>Recents</Label>
      </NativeTabs.Trigger>
            <NativeTabs.Trigger name="UserMap">
        <Icon sf={"house.fill"} drawable="ic_menu_mylocation" />
        <Label>Map</Label>
      </NativeTabs.Trigger>
            <NativeTabs.Trigger name="UserProfile">
        <Icon sf={"house.fill"} drawable="ic_menu_mylocation" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}