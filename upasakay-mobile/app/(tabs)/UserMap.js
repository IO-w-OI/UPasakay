import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import UserMapScreen from '../../screens/UserMap';

export default function TabMap() {
  return (
    <>
      <Tabs.Screen options={{
        title: 'Map',
        tabBarIcon: ({ color }) => <Ionicons name="map" size={24} color={color} />,
      }} />
      <UserMapScreen />
    </>
  );
}