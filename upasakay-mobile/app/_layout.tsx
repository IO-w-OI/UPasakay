import { Nunito_400Regular, Nunito_700Bold, useFonts } from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Prevent the splash screen from hiding until fonts are ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // If fonts aren't loaded and there's no error, keep showing the splash screen
  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack 
      initialRouteName="index" 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#701929' } 
      }}
    >
      <Stack.Screen name="index" /> 
      <Stack.Screen name="Signup" />
      <Stack.Screen name="(tabs)" /> 
    </Stack>
  );
}