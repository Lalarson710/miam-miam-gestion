import { Stack } from 'expo-router';

export default function ProduitsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="nouveau" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
