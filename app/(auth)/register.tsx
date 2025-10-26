import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
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
  
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );


      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }


      setStatus("Registro exitoso");

    
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

      <TextInput
        placeholder="Nombre (opcional)"
        placeholderTextColor="#5B6670"
        value={displayName}
        onChangeText={setDisplayName}
        style={styles.input}
      />
      <TextInput
        placeholder="Correo electrónico"
        placeholderTextColor="#5B6670"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Contraseña"
        placeholderTextColor="#5B6670"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator color="#EB0029" />
      ) : (
        <TouchableOpacity style={styles.primaryButton} onPress={onRegister}>
          <Text style={styles.primaryButtonText}>Crear cuenta</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
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
});