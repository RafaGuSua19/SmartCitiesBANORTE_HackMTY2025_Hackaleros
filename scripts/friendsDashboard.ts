import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";

// Obtiene el resumen público de un usuario (si lo tiene y lo comparte)
export async function getPublicSummaryIfShared(uid: string) {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (!userDoc.exists() || !userDoc.data().shareStats) return null;

  const summaryDoc = await getDoc(doc(db, "public_summaries", uid));
  if (!summaryDoc.exists()) return null;
  return { uid, ...summaryDoc.data() };
}

// Obtiene el score público del usuario actual (tú)
export async function getMySummary() {
  const me = auth.currentUser?.uid!;
  const sumDoc = await getDoc(doc(db, "public_summaries", me));
  if (!sumDoc.exists()) return null;
  return { uid: me, ...sumDoc.data() };
}

// Lista UIDs de amigos
export async function getMyFriends() {
  const me = auth.currentUser?.uid!;
  const listSnap = await getDocs(collection(db, "friends", me, "list"));
  return listSnap.docs.map((d) => d.id);
}

// Carga nombres y usernames para mostrar en mensajes
export async function getBasicProfile(uid: string) {
  const docSnap = await getDoc(doc(db, "users", uid));
  if (docSnap.exists()) {
    const d = docSnap.data();
    return { displayName: d.displayName, username: d.username };
  }
  return { displayName: "", username: "" };
}
