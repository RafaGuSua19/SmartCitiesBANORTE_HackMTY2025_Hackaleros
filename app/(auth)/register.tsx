import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    Text,
    TextInput,
    View,
} from "react-native";
import { auth } from "../../scripts/firebase";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const onRegister = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Ingresa email y contraseña");
      return;
    }

    setLoading(true);
    setStatus("Creando cuenta...");

    try {
      // 1️⃣ Crear usuario en Firebase Auth
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // 2️⃣ Asignar displayName (opcional)
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }

      // 3️⃣ Asumir éxito y mostrar mensaje
      setStatus("Registro exitoso");

      // 4️⃣ Redirigir a la pantalla de éxito
      setTimeout(() => {
        router.replace("/(auth)/success");
      }, 1000);
    } catch (error: any) {
      console.error("❌ Error de registro:", error);
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Error", "Este correo ya está registrado");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Error", "Formato de correo inválido");
      } else if (error.code === "auth/weak-password") {
        Alert.alert("Error", "La contraseña es demasiado débil");
      } else {
        Alert.alert("Error", error.message ?? "No se pudo registrar");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        gap: 12,
        padding: 16,
        justifyContent: "center",
      }}
    >
      <TextInput
        placeholder="Nombre (opcional)"
        onChangeText={setDisplayName}
        value={displayName}
        style={{
          borderWidth: 1,
          padding: 12,
          borderRadius: 8,
        }}
      />
      <TextInput
        placeholder="Correo"
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
        style={{
          borderWidth: 1,
          padding: 12,
          borderRadius: 8,
        }}
      />
      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
        style={{
          borderWidth: 1,
          padding: 12,
          borderRadius: 8,
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#EB0029" />
      ) : (
        <Button title="Crear cuenta" onPress={onRegister} />
      )}

      {status ? (
        <Text style={{ textAlign: "center", color: "gray", marginTop: 10 }}>
          {status}
        </Text>
      ) : null}
    </View>
  );
}