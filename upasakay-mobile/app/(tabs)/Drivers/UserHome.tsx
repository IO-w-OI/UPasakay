import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import UserHomeScreen from '../../screens/Users/UserHome';

export default function TabHome() {
  return (
    <>
      <Tabs.Screen options={{
        title: 'Home',
        tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
      }} />
      <UserHomeScreen />
    </>
  );
}