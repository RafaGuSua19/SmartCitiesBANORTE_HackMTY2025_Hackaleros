import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// Registrar ingreso mensual o meta
export async function updateProfileIncomeGoal({ monthlyIncome, savingGoal }: { monthlyIncome: number; savingGoal: number }) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("No autenticado");
  await setDoc(doc(db, "users", uid), { monthlyIncome, savingGoal }, { merge: true });
}

// Registrar egreso (gasto)
export async function addExpense({ amount, type, note = "" }: { amount: number; type: string; note?: string }) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("No autenticado");
  await addDoc(collection(db, "expenses", uid, "transactions"), {
    amount,
    type,
    note,
    createdAt: serverTimestamp(),
  });
}

// Obtener todas las transacciones del mes actual
export async function getCurrentMonthExpenses() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("No autenticado");
  const q = collection(db, "expenses", uid, "transactions");
  const docs = await getDocs(q);
  const now = new Date();
  const thisMonth = now.getMonth();
  return docs.docs
    .map((d) => d.data())
    .filter((tx: any) => {
      const d = tx.createdAt?.toDate?.() ?? new Date();
      return d.getMonth() === thisMonth && d.getFullYear() === now.getFullYear();
    });
}

// Calcular y actualizar resumen
export async function updateMySummary() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("No autenticado");
  const userDoc = await getDoc(doc(db, "users", uid));
  const { monthlyIncome = 1, savingGoal = 0 } = userDoc.exists() ? userDoc.data() : {};
  const txs = await getCurrentMonthExpenses();

  let totalSpent = 0, byCategory = { agua: 0, luz: 0, gasolina: 0 };
  for (const tx of txs) {
    const amount = tx.amount || 0;
    totalSpent += amount;
    const key = tx.type as keyof typeof byCategory;
    if (key && Object.prototype.hasOwnProperty.call(byCategory, key)) {
      byCategory[key] += amount;
    }
  }
  const savingPercent = monthlyIncome ? Math.max(0, 100 - ((totalSpent / monthlyIncome) * 100)) : 0;
  const goalMet = (monthlyIncome - totalSpent) >= savingGoal;
  await setDoc(doc(db, "summaries", uid), {
    totalSpent,
    savingPercent,
    byCategory,
    goalMet,
    updatedAt: new Date(),
  });
  return { totalSpent, savingPercent, byCategory, goalMet };
}
