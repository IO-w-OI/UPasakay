import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import DriverMapScreen from '../../../screens/Drivers/DriverMap';

export default function TabMap() {
  return (
    <>
      <Tabs.Screen options={{
        title: 'Map',
        tabBarIcon: ({ color }) => <Ionicons name="map" size={24} color={color} />,
      }} />
      <DriverMapScreen />
    </>
  );
}