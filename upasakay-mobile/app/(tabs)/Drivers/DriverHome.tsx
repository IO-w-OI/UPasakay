import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import DriverHome from '../../../screens/Drivers/DriverHome';

export default function TabHome() {
  return (
    <>
      <Tabs.Screen options={{
        title: 'Home',
        tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
      }} />
      <DriverHome />
    </>
  );
}