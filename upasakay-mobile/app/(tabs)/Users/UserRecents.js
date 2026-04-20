import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import UserRecents from '../../../screens/Users/UserRecents';

export default function TabRecents() {
  return (
    <>
      <Tabs.Screen 
        options={{
          title: 'Recents',
          tabBarIcon: ({ color }) => <Ionicons name="time" size={24} color={color} />,
        }} 
      />
      <UserRecents />
    </>
  );
}