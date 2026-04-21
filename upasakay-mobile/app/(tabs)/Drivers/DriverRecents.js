import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import DriverRequests from '../../../screens/Drivers/DriverRequests';

export default function TabRecents() {
  return (
    <>
      <Tabs.Screen 
        options={{
          title: 'Recents',
          tabBarIcon: ({ color }) => <Ionicons name="time" size={24} color={color} />,
        }} 
      />
      <DriverRequests />
    </>
  );
}