// app/(auth)/register.tsx
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { auth, db } from "../../scripts/firebase";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const onRegister = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Ingresa email y contraseña");
      return;
    }
    try {
      // 1) Crea usuario en Firebase Auth
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // 2) (Opcional) asigna displayName
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }

      // 3) Guarda perfil en Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: displayName || null,
        createdAt: serverTimestamp(),
      });

      // 4) Lleva a pantalla de éxito
      router.replace("//success");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo registrar");
    }
  };

  return (
    <View style={{ flex: 1, gap: 12, padding: 16, justifyContent: "center" }}>
      <TextInput
        placeholder="Nombre (opcional)"
        onChangeText={setDisplayName}
        value={displayName}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />
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

      <Button title="Crear cuenta" onPress={onRegister} />
    </View>
  );
}
