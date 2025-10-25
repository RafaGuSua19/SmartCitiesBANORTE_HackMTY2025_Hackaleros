import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    Text,
    TextInput,
    View,
} from "react-native";
import { auth, db } from "../../scripts/firebase";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const onRegister = async () => {
    if (!email || !password || !username) {
      Alert.alert("Error", "Completa todos los campos requeridos");
      return;
    }

    const usernameLower = username.trim().toLowerCase();
    setLoading(true);
    setStatus("Verificando username...");

    try {
      // 1️⃣ Checa que el username sea único
      const unameRef = doc(db, "usernames", usernameLower);
      const unameSnap = await getDoc(unameRef);
      if (unameSnap.exists()) {
        setLoading(false);
        Alert.alert("Error", "El username ya está en uso. Prueba otro.");
        return;
      }

      setStatus("Creando cuenta...");

      // 2️⃣ Crear usuario en Auth
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // 3️⃣ Asignar displayName (opcional)
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }

      // 4️⃣ Reservar username y crear perfil en Firestore
      await setDoc(unameRef, { uid: cred.user.uid });
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: displayName || "",
        username,
        usernameLower,
        photoURL: cred.user.photoURL || null,
        createdAt: serverTimestamp(),
      });

      setStatus("Registro exitoso ✅");

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
        placeholder="Nombre de usuario (único, sin espacios)"
        autoCapitalize="none"
        onChangeText={setUsername}
        value={username}
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
