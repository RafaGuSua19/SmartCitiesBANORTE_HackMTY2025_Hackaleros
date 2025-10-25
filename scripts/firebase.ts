// scripts/firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC8PA-QETCZnmPbs56N3KayLO6wbug4O84",
  authDomain: "smart-city-app-3aa2d.firebaseapp.com",
  projectId: "smart-city-app-3aa2d",
  storageBucket: "smart-city-app-3aa2d.firebasestorage.app",
  messagingSenderId: "171122483833",
  appId: "1:171122483833:web:8db8bad0619e0a5a1f2aa8",
  measurementId: "G-X334124BTJ"
};

// ✅ Asegura inicialización única (evita errores 'duplicate-app')
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Instancias únicas y correctamente configuradas
export const auth = getAuth(app);
export const db = getFirestore(app);
