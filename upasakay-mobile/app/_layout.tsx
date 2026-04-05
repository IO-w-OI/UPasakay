import { Stack } from 'expo-router';
// ... your other imports (Fonts, SplashScreen, etc.)

export default function RootLayout() {
  // ... your font loading logic ...

  return (
    <Stack 
      // 1. Updated to "index" because your Login file is now index.tsx
      initialRouteName="index" 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#701929' } 
      }}
    >
      {/* 2. Changed from "Login" to "index" to match the filename */}
      <Stack.Screen name="index" /> 
      
      <Stack.Screen name="Signup" />
      
      {/* This remains the same to point to your app/(tabs)/ folder */}
      <Stack.Screen name="(tabs)" /> 
    </Stack>
  );
}