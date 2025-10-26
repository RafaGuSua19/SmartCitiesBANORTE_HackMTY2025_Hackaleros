import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Ingresa email y contraseña");
      return;
    }
    setLoading(true);
    try {
      // Intenta iniciar sesión
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
    } catch (error: any) {
      // Manejo de errores comunes
      if (error.code === "auth/user-not-found") {
        Alert.alert("Error", "El usuario no existe");
      } else if (error.code === "auth/wrong-password") {
        Alert.alert("Error", "Contraseña incorrecta");
      } else {
        Alert.alert("Error", error.message ?? "No se pudo iniciar sesión");
      }
    }  finally {
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
      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>

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
        <TouchableOpacity style={styles.primaryButton} onPress={onLogin}>
          <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
        <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
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