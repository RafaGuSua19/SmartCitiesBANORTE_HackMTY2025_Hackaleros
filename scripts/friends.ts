import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    endAt,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    startAt,
    updateDoc,
    where,
} from "firebase/firestore";
import { auth, db } from "./firebase";

// Buscar usuarios por prefijo de username
export async function searchUsersByUsernamePrefix(prefix: string) {
  const text = prefix.trim().toLowerCase();
  if (!text) return [];
  const q = query(
    collection(db, "users"),
    orderBy("usernameLower"),
    startAt(text),
    endAt(text + "\uf8ff"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

// Enviar solicitud de amistad
export async function sendFriendRequest(toUid: string) {
  const fromUid = auth.currentUser?.uid;
  if (!fromUid) throw new Error("No autenticado");
  if (fromUid === toUid) throw new Error("No puedes agregarte a ti mismo");
  await addDoc(collection(db, "friend_requests"), {
    fromUid,
    toUid,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

// Suscribirse a solicitudes recibidas (callback se llama en cada cambio)
export function subscribeIncomingRequests(cb: (reqs: any[]) => void) {
  const uid = auth.currentUser?.uid;
  if (!uid) return () => {};
  const q = query(
    collection(db, "friend_requests"),
    where("toUid", "==", uid),
    where("status", "==", "pending")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// Aceptar solicitud
export async function acceptFriendRequest(request: { id: string; fromUid: string; toUid: string }) {
  await updateDoc(doc(db, "friend_requests", request.id), { status: "accepted" });
  // Ambos se agregan como amigos
  await setDoc(doc(db, "friends", request.toUid, "list", request.fromUid), {
    friendUid: request.fromUid,
    since: serverTimestamp(),
  });
  await setDoc(doc(db, "friends", request.fromUid, "list", request.toUid), {
    friendUid: request.toUid,
    since: serverTimestamp(),
  });
  await deleteDoc(doc(db, "friend_requests", request.id));
}

// Listar amigos (IDs)
export async function getMyFriends() {
  const me = auth.currentUser?.uid!;
  const listSnap = await getDocs(collection(db, "friends", me, "list"));
  return listSnap.docs.map((d) => d.id); // Array de friendUid
}

// Obtener perfil básico por UID
export async function getUserProfile(uid: string) {
  const docSnap = await getDocs(query(collection(db, "users"), where("uid", "==", uid)));
  if (!docSnap.empty) {
    return { uid, ...docSnap.docs[0].data() };
  }
  return null;
}
