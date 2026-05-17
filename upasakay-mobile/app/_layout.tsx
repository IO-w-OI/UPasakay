import { Nunito_400Regular, Nunito_700Bold, useFonts } from '@expo-google-fonts/nunito';
import { Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import * as Notifications from 'expo-notifications';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TripProvider } from '../context/TripContext';
import ActiveTripBanner from '../components/ActiveTripBanner';
import { currentUser, restoreSession } from '../services/UserStore';
import { registerForPushNotifications, routeForNotificationData } from '../services/pushNotifications';

// This determines how notifications appear when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // Required by current types
    shouldShowList: true,   // Required by current types
  }),
});

// Prevent the splash screen from hiding until fonts are ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Preload the icon fonts too — otherwise @expo/vector-icons tries to
  // download them lazily at first render, which fails in dev (ExpoAsset
  // download rejected) and shows empty icon boxes + an unhandled-promise
  // error toast on navigation/logout.
  const [loaded, error] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
    ...Octicons.font,
  });

  // Restore any persisted login session before the navigator mounts so
  // API calls and the index route see currentUser immediately.
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    restoreSession()
      .then((user) => {
        // Re-register for push if a session was restored (token may have rotated).
        if (user?.token || currentUser?.token) {
          registerForPushNotifications();
        }
      })
      .finally(() => setSessionChecked(true));
  }, []);

  // Tapping a push notification deep-links to the relevant screen.
  useEffect(() => {
    const go = (response: Notifications.NotificationResponse | null) => {
      const data = response?.notification?.request?.content?.data;
      const path = routeForNotificationData(data);
      if (path) {
        router.push(path as any);
      }
    };

    // Cold start: app opened by tapping a notification.
    Notifications.getLastNotificationResponseAsync().then(go);

    // Warm: tapped while app was running/backgrounded.
    const sub = Notifications.addNotificationResponseReceivedListener(go);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if ((loaded || error) && sessionChecked) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, sessionChecked]);

  // Keep the splash screen until fonts AND the session check are done
  if ((!loaded && !error) || !sessionChecked) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <TripProvider>
        <Stack
          initialRouteName="index"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#701929' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="Signup" />
          <Stack.Screen name="ForgotPassword" />
          <Stack.Screen name="ResetPassword" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <ActiveTripBanner />
      </TripProvider>
    </SafeAreaProvider>
  );
}
