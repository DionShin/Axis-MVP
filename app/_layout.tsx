import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal/add-routine" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modal/recovery" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
