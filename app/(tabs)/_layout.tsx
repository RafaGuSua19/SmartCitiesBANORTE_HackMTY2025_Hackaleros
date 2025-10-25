// app/(auth)/_layout.tsx
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, title: "" }}>
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="register" options={{ title: "Crear cuenta" }} />
      <Stack.Screen name="success" options={{ title: "Registro exitoso" }} />
    </Stack>
  );
}
