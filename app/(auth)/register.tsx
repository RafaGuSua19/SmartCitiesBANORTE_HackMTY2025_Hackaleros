import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
      // Verifica que el username sea único
      const unameRef = doc(db, "usernames", usernameLower);
      const unameSnap = await getDoc(unameRef);
      if (unameSnap.exists()) {
        setLoading(false);
        Alert.alert("Error", "El username ya está en uso. Prueba otro.");
        return;
      }

      setStatus("Creando cuenta...");

      // Crea el usuario en Auth
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // Asigna displayName en Auth
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }

      // Reserva el username
      await setDoc(unameRef, { uid: cred.user.uid });

      // Guarda el perfil del usuario en Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: displayName || "",
        username: username.trim(),
        usernameLower,
        photoURL: cred.user.photoURL || null,
        createdAt: serverTimestamp(),
      });

      setStatus("Registro exitoso ");
      Alert.alert("Cuenta creada", "Tu perfil se ha guardado correctamente.");


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
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/Logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Crea tu cuenta</Text>
      <Text style={styles.subtitle}>Regístrate para continuar</Text>

      {/* 🧍 Nombre */}
      <TextInput
        placeholder="Nombre completo (opcional)"
        placeholderTextColor="#5B6670"
        onChangeText={setDisplayName}
        value={displayName}
        style={styles.input}
      />

      {/* 🆔 Username */}
      <TextInput
        placeholder="Nombre de usuario (único, sin espacios)"
        placeholderTextColor="#5B6670"
        autoCapitalize="none"
        onChangeText={setUsername}
        value={username}
        style={styles.input}
      />

      {/* 📧 Email */}
      <TextInput
        placeholder="Correo electrónico"
        placeholderTextColor="#5B6670"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      {/* 🔒 Password */}
      <TextInput
        placeholder="Contraseña"
        placeholderTextColor="#5B6670"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      {/* 🔄 Botón principal */}
      {loading ? (
        <ActivityIndicator color="#EB0029" />
      ) : (
        <TouchableOpacity style={styles.primaryButton} onPress={onRegister}>
          <Text style={styles.primaryButtonText}>Crear cuenta</Text>
        </TouchableOpacity>
      )}

      {/* 🔗 Ir al login */}
      <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>

      {/* 🔄 Estado de registro */}
      {status ? (
        <Text style={styles.status}>{status}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 25,
    justifyContent: "center",
  },
  logo: {
    width: 220,
    height: 80,
    alignSelf: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#323E48",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    color: "#5B6670",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#F6F6F6",
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    fontSize: 15,
    color: "#323E48",
  },
  primaryButton: {
    backgroundColor: "#EB0029",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 5,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#DB0026",
    fontWeight: "500",
  },
  status: {
    textAlign: "center",
    color: "#5B6670",
    marginTop: 10,
  },
});
