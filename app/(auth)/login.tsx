import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { auth } from "../../scripts/firebase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Ingresa email y contraseña");
      return;
    }

    try {
      // Intenta iniciar sesión
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // Si el usuario existe, redirige a success
      if (userCredential.user) {
        router.replace("/(auth)/success");
      }
    } catch (error: any) {
      // Manejo de errores comunes
      if (error.code === "auth/user-not-found") {
        Alert.alert("Error", "El usuario no existe");
      } else if (error.code === "auth/wrong-password") {
        Alert.alert("Error", "Contraseña incorrecta");
      } else {
        Alert.alert("Error", error.message ?? "No se pudo iniciar sesión");
      }
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
      <Button
        title="Crear cuenta"
        onPress={() => router.push("/(auth)/register")}
      />
    </View>
  );
}
