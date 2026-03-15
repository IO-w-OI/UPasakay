import {
  Nunito_400Regular,
  Nunito_700Bold,
  useFonts
} from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Keep the splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Nunito-Regular': Nunito_400Regular,
    'Nunito-Bold': Nunito_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* This ensures the entire app background is maroon, 
          which helps get rid of that white bar area! */}
      <Stack.Screen 
        name="(tabs)" 
        options={{ contentStyle: { backgroundColor: '#701929' } }} 
      />
    </Stack>
  );
}
