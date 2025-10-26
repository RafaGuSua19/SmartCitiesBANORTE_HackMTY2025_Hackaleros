import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

async function fixIncompleteUsers() {
  const snapshot = await getDocs(collection(db, "users"));
  for (const userDoc of snapshot.docs) {
    const data = userDoc.data();

    // Solo actualiza si le faltan los campos
    if (!data.estadisticas || !data.gastos || data.progresoAhorro === undefined) {
      await updateDoc(doc(db, "users", userDoc.id), {
        estadisticas: {
          aguaReducida: data.estadisticas?.aguaReducida ?? 0,
          co2Reducido: data.estadisticas?.co2Reducido ?? 0,
        },
        gastos: {
          agua: data.gastos?.agua ?? 0,
          gasolina: data.gastos?.gasolina ?? 0,
          luz: data.gastos?.luz ?? 0,
        },
        metaAhorro: data.metaAhorro ?? 2500,
        presupuestoMensual: data.presupuestoMensual ?? 10000,
        progresoAhorro: data.progresoAhorro ?? 0,
      });

      console.log(`✅ Usuario ${userDoc.id} actualizado`);
    }
  }
  console.log("🎉 Todos los usuarios fueron verificados y completados");
}

fixIncompleteUsers();
