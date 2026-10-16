import { Stack } from 'expo-router';

export default function DepensesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="nouvelle-depense" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
