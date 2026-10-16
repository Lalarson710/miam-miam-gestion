import { Stack } from 'expo-router';

export default function VentesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="nouvelle-vente" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
