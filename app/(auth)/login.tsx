// app/(auth)/login.tsx
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { auth } from "../../scripts/firebase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter(); // ✅ ESTA LÍNEA ES LA CLAVE

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Ingresa email y contraseña");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert("Listo", "Inicio de sesión exitoso");
      // Ejemplo: router.replace("/explore"); // luego rediriges al home
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo iniciar sesión");
    }
  };

  return (
    <View style={{ flex: 1, gap: 12, padding: 16, justifyContent: "center" }}>
      <TextInput
        placeholder="Correo"
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />
      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />

      <Button title="Iniciar sesión" onPress={onLogin} />

      <Button title="Crear cuenta" onPress={() => router.push("/register")} />
    </View>
  );
}
