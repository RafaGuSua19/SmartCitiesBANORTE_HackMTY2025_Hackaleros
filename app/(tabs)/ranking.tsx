import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { auth, db } from "../../scripts/firebase";
import { getMyFriends } from "../../scripts/friends";

export default function RankingScreen() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRanking = async () => {
      try {
        setLoading(true);
        const currentUid = auth.currentUser?.uid;
        if (!currentUid) return;

        // 1️⃣ Obtener los amigos
        const friendUids = await getMyFriends();
        const uids = [currentUid, ...friendUids];

        // 2️⃣ Obtener datos desde Firestore
        const users: any[] = [];
        for (const uid of uids) {
          const snap = await getDoc(doc(db, "users", uid));
          if (snap.exists()) {
            const data = snap.data();

            // ⚙️ Soporte flexible para 'estadisticas' y 'estadísticas'
            const est = data.estadisticas || data["estadísticas"] || {};

            // Calcular el total de reducción (CO2 + agua)
            const totalReduccion = (data.co2Reducido ?? 0) + (data.aguaReducida ?? 0);

            // Asegurarse de que 'progresoAhorro' exista
            const progresoAhorro = data.progresoAhorro ?? 0;

            users.push({
              uid,
              displayName: data.displayName || "(Sin nombre)",
              username: data.username || "—",
              progresoAhorro,
              co2: data.co2Reducido ?? 0,
              agua: data.aguaReducida ?? 0,
              totalReduccion, // Agregar la reducción total
            });
          }
        }

        // 3️⃣ Ordenar por reducción total (de mayor a menor)
        users.sort((a, b) => b.totalReduccion - a.totalReduccion);
        setRanking(users);
      } catch (error) {
        console.error("❌ Error al cargar ranking:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRanking();
  }, []);

  const currentUid = auth.currentUser?.uid;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ranking de Ahorro</Text>

      {loading ? (
        <ActivityIndicator color="#EB0029" size="large" />
      ) : (
        <FlatList
          data={ranking}
          keyExtractor={(item, index) => item.uid || index.toString()} // ✅ Key única
          renderItem={({ item, index }) => {
            const isCurrentUser = item.uid === currentUid;
            return (
              <View
                key={item.uid || index.toString()}
                style={[
                  styles.card,
                  index === 0 && { borderColor: "#FFD700", borderWidth: 3 }, // 🥇 Oro
                  index === 1 && { borderColor: "#C0C0C0", borderWidth: 3 }, // 🥈 Plata
                  index === 2 && { borderColor: "#CD7F32", borderWidth: 3 }, // 🥉 Bronce
                
                ]}
              >
                <Text style={styles.position}>{index + 1}</Text>
                <View style={styles.userInfo}>
                  <Text style={styles.name}>{item.displayName}</Text>
                  <Text style={styles.username}>@{item.username}</Text>
                  <Text style={styles.sub}>
                    CO₂ reducido: {item.co2} kg | Agua: {item.agua} L | Total: {item.totalReduccion} L
                  </Text>
                </View>
                <Text style={styles.points}>${item.progresoAhorro}</Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#EB0029",
    marginBottom: 20,
    paddingTop:30,
    textAlign: "center",
    fontFamily: "Roboto",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderColor: "transparent",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  position: {
    fontSize: 22,
    fontWeight: "800",
    color: "#EB0029",
    marginRight: 20,
  },
  userInfo: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#323E48",
  },
  username: {
    fontSize: 14,
    color: "#5B6670",
  },
  sub: {
    fontSize: 13,
    color: "#707070",
    marginTop: 4,
  },
  points: {
    fontSize: 16,
    fontWeight: "700",
    color: "#323E48",
  },
});
