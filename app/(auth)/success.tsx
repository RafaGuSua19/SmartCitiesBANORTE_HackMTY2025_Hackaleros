// app/(auth)/success.tsx
import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function SuccessScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 16 }}>
      <Text style={{ fontSize: 18, textAlign: "center" }}>
        ¡Tu cuenta se creó correctamente!
      </Text>
      <Button title="Volver al login" onPress={() => router.replace("//login")} />
    </View>
  );
}
