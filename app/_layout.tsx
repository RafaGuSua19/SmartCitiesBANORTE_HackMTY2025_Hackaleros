// app/_layout.tsx
import { Redirect, Stack } from "expo-router";
import { useContext } from "react";
import { ActivityIndicator, View } from "react-native";

import { AuthContext, AuthProvider } from "../context/AuthContext";
function RootLayoutContent() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Si hay usuario → entra a las tabs
  // Si no hay usuario → va al login
  if (!user) return <Redirect href="/(auth)/login" />;

  return <Redirect href="/(tabs)" />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <RootLayoutContent />
    </AuthProvider>
  );
}
