// app/UserBooking.tsx
import { useLocalSearchParams } from 'expo-router';
import UserBookingScreen from '../screens/UserBooking'; // Import from your screens folder

export default function Route() {
  const { busId } = useLocalSearchParams();

  return <UserBookingScreen busId={busId} />;
}
