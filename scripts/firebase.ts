import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { Auth, browserLocalPersistence, getAuth, inMemoryPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";
const firebaseConfig = {
  apiKey: "AIzaSyC8PA-QETCZnmPbs56N3KayLO6wbug4O84",
  authDomain: "smart-city-app-3aa2d.firebaseapp.com",
  projectId: "smart-city-app-3aa2d",
  storageBucket: "smart-city-app-3aa2d.firebasestorage.app",
  messagingSenderId: "171122483833",
  appId: "1:171122483833:web:8db8bad0619e0a5a1f2aa8",
  measurementId: "G-X334124BTJ"
};

// ✅ Evita inicializar más de una app
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();




let auth: Auth;

if (Platform.OS === "web") {
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence);
} else {
  try {
    // Solo funcionará si tu Firebase soporta la API nativa
    const { initializeAuth, getReactNativePersistence } = require("firebase/auth/react-native");
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // Si no existe "firebase/auth/react-native", usamos fallback
    auth = getAuth(app);
    setPersistence(auth, inMemoryPersistence);
    console.warn("⚠️ Persistencia nativa no disponible, usando memoria temporal.");
  }
}

// 🔥 Base de datos Firestore
const db = getFirestore(app);

export { app, auth, db };

