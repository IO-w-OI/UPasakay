import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import UserProfile from '../../../screens/Drivers/DriverProfile';

export default function TabProfile() {
  return (
    <>
      <Tabs.Screen 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }} 
      />
      <UserProfile />
    </>
  );
}