import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0b0f14' },
          headerTintColor: '#e8eef5',
          contentStyle: { backgroundColor: '#0b0f14' },
        }}
      />
    </>
  );
}
